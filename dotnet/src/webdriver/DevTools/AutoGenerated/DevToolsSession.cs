
namespace OpenQA.Selenium.DevTools
{
    using System;
    using System.Collections.Concurrent;
    using System.Diagnostics;
    using System.IO;
    using System.Net.WebSockets;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Linq;

    /// <summary>
    /// Represents a WebSocket connection to a running DevTools instance that can be used to send
    /// commands and recieve events.
    ///</summary>
    public partial class DevToolsSession : IDisposable
    {
        private readonly string m_endpointAddress;
        private readonly TimeSpan m_closeConnectionWaitTimeSpan = TimeSpan.FromSeconds(2);

        private ClientWebSocket m_sessionSocket;
        private ConcurrentDictionary<long, DevToolsCommandData> m_pendingCommands = new ConcurrentDictionary<long, DevToolsCommandData>();
        private long m_currentCommandId = 0;

        private Task m_receiveTask;

        /// <summary>
        /// Initializes a new instance of the DevToolsSession class, using the specified WebSocket endpoint.
        /// </summary>
        /// <param name="endpointAddress"></param>
        public DevToolsSession(string endpointAddress)
            : this()
        {
            if (String.IsNullOrWhiteSpace(endpointAddress))
                throw new ArgumentNullException(nameof(endpointAddress));

            CommandTimeout = 5000;
            m_endpointAddress = endpointAddress;

            m_sessionSocket = new ClientWebSocket();
        }

        /// <summary>
        /// Event raised when the DevToolsSession logs informational messages.
        /// </summary>
        public event EventHandler<DevToolsSessionLogMessageEventArgs> LogMessage;

        /// <summary>
        /// Event raised an event notification is received from the DevTools session.
        /// </summary>
        internal event EventHandler<DevToolsEventReceivedEventArgs> DevToolsEventReceived;

        /// <summary>
        /// Gets or sets the number of milliseconds to wait for a command to complete. Default is 5 seconds.
        /// </summary>
        public int CommandTimeout
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the active session ID of the connection.
        /// </summary>
        public string ActiveSessionId
        {
            get;
            set;
        }

        /// <summary>
        /// Gets the endpoint address of the session.
        /// </summary>
        public string EndpointAddress
        {
            get { return m_endpointAddress; }
        }

        /// <summary>
        /// Sends the specified command and returns the associated command response.
        /// </summary>
        /// <typeparam name="TCommand"></typeparam>
        /// <param name="command"></param>
        /// <param name="cancellationToken"></param>
        /// <param name="millisecondsTimeout"></param>
        /// <param name="throwExceptionIfResponseNotReceived"></param>
        /// <returns></returns>
        public async Task<ICommandResponse<TCommand>> SendCommand<TCommand>(TCommand command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
            where TCommand : ICommand
        {
            if (command == null)
                throw new ArgumentNullException(nameof(command));

            var result = await SendCommand(command.CommandName, JToken.FromObject(command), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);

            if (result == null)
                return null;

            if (!CommandResponseTypeMap.TryGetCommandResponseType<TCommand>(out Type commandResponseType))
                throw new InvalidOperationException($"Type {typeof(TCommand)} does not correspond to a known command response type.");

            return result.ToObject(commandResponseType) as ICommandResponse<TCommand>;
        }

        /// <summary>
        /// Sends the specified command and returns the associated command response.
        /// </summary>
        /// <typeparam name="TCommand"></typeparam>
        /// <typeparam name="TCommandResponse"></typeparam>
        /// <param name="command"></param>
        /// <param name="cancellationToken"></param>
        /// <param name="millisecondsTimeout"></param>
        /// <param name="throwExceptionIfResponseNotReceived"></param>
        /// <returns></returns>
        public async Task<TCommandResponse> SendCommand<TCommand, TCommandResponse>(TCommand command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
            where TCommand : ICommand
            where TCommandResponse : ICommandResponse<TCommand>
        {
            if (command == null)
                throw new ArgumentNullException(nameof(command));

            var result = await SendCommand(command.CommandName, JToken.FromObject(command), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);

            if (result == null)
                return default(TCommandResponse);

            return result.ToObject<TCommandResponse>();
        }

        /// <summary>
        /// Returns a JToken based on a command created with the specified command name and params.
        /// </summary>
        /// <param name="commandName"></param>
        /// <param name="params"></param>
        /// <param name="cancellationToken"></param>
        /// <param name="millisecondsTimeout"></param>
        /// <param name="throwExceptionIfResponseNotReceived"></param>
        /// <returns></returns>
        //[DebuggerStepThrough]
        public async Task<JToken> SendCommand(string commandName, JToken @params, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            var message = new DevToolsCommandData(Interlocked.Increment(ref m_currentCommandId), ActiveSessionId, commandName, @params);

            if (millisecondsTimeout.HasValue == false)
                millisecondsTimeout = CommandTimeout;

            await OpenSessionConnection(cancellationToken);

            LogTrace("Sending {0} {1}: {2}", message.CommandId, message.CommandName, @params.ToString());

            var contents = JsonConvert.SerializeObject(message);
            var contentBuffer = Encoding.UTF8.GetBytes(contents);

            m_pendingCommands.TryAdd(message.CommandId, message);
            await m_sessionSocket.SendAsync(new ArraySegment<byte>(contentBuffer), WebSocketMessageType.Text, true, cancellationToken);

            var responseWasReceived = await Task.Run(() => message.SyncEvent.Wait(millisecondsTimeout.Value, cancellationToken));

            if (!responseWasReceived && throwExceptionIfResponseNotReceived)
            {
                throw new InvalidOperationException($"A command response was not received: {commandName}");
            }

            if (m_pendingCommands.TryRemove(message.CommandId, out var modified))
            {
                if (modified.IsError)
                {
                    var errorMessage = modified.Result.Value<string>("message");
                    var errorData = modified.Result.Value<string>("data");

                    var exceptionMessage = $"{commandName}: {errorMessage}";
                    if (!String.IsNullOrWhiteSpace(errorData))
                        exceptionMessage = $"{exceptionMessage} - {errorData}";

                    LogTrace("Recieved Error Response {0}: {1} {2}", modified.CommandId, message, errorData);
                    throw new CommandResponseException(exceptionMessage)
                    {
                        Code = modified.Result.Value<long>("code")
                    };
                }

                return modified.Result;
            }

            return null;
        }

        private async Task OpenSessionConnection(CancellationToken cancellationToken)
        {
            if (m_sessionSocket == null)
            {
                return;
            }

            // Try to prevent "System.InvalidOperationException: The WebSocket has already been started."
            while (m_sessionSocket.State == WebSocketState.Connecting)
            {
                if (cancellationToken.IsCancellationRequested)
                {
                    return;
                }

                await Task.Delay(10);
            }

            if (m_sessionSocket.State != WebSocketState.Open)
            {
                await m_sessionSocket.ConnectAsync(new Uri(m_endpointAddress), cancellationToken);

                m_receiveTask = Task.Run(async () => await ReceiveMessage(cancellationToken));
            }
        }

        private async Task ReceiveMessage(CancellationToken cancellationToken)
        {
            while (m_sessionSocket.State == WebSocketState.Open)
            {
                WebSocketReceiveResult result = null;
                var buffer = WebSocket.CreateClientBuffer(1024, 1024);
                try
                {
                    result = await m_sessionSocket.ReceiveAsync(buffer, cancellationToken);
                }
                catch (OperationCanceledException)
                {
                }
                catch (WebSocketException)
                {
                    // If we receive a WebSocketException, there's not much we can do
                    // so we'll just terminate our listener.
                    break;
                }

                if (cancellationToken.IsCancellationRequested)
                {
                    break;
                }

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    break;
                }
                else
                {
                    using (var stream = new MemoryStream())
                    {
                        stream.Write(buffer.Array, 0, result.Count);
                        while (!result.EndOfMessage)
                        {
                            result = await m_sessionSocket.ReceiveAsync(buffer, cancellationToken);
                            stream.Write(buffer.Array, 0, result.Count);
                        }

                        stream.Seek(0, SeekOrigin.Begin);
                        using (var reader = new StreamReader(stream, Encoding.UTF8))
                        {
                            string message = reader.ReadToEnd();
                            ProcessIncomingMessage(message);
                        }
                    }
                }
            }
        }

        private void ProcessIncomingMessage(string message)
        {
            var messageObject = JObject.Parse(message);

            if (messageObject.TryGetValue("id", out var idProperty))
            {
                var commandId = idProperty.Value<long>();

                DevToolsCommandData commandInfo;
                if (m_pendingCommands.TryGetValue(commandId, out commandInfo))
                {
                    if (messageObject.TryGetValue("error", out var errorProperty))
                    {
                        commandInfo.IsError = true;
                        commandInfo.Result = errorProperty;
                    }
                    else
                    {
                        commandInfo.Result = messageObject["result"];
                        LogTrace("Recieved Response {0}: {1}", commandId, commandInfo.Result.ToString());
                    }

                    commandInfo.SyncEvent.Set();
                }
                else
                {
                    LogError("Recieved Unknown Response {0}: {1}", commandId, message);
                }

                return;
            }

            if (messageObject.TryGetValue("method", out var methodProperty))
            {
                var method = methodProperty.Value<string>();
                var methodParts = method.Split(new char[] { '.' }, 2);
                var eventData = messageObject["params"];

                LogTrace("Recieved Event {0}: {1}", method, eventData.ToString());
                OnDevToolsEventReceived(new DevToolsEventReceivedEventArgs(methodParts[0], methodParts[1], eventData));
                return;
            }

            LogTrace("Recieved Other: {0}", message);
        }

        private void OnDevToolsEventReceived(DevToolsEventReceivedEventArgs e)
        {
            if (DevToolsEventReceived != null)
            {
                DevToolsEventReceived(this, e);
            }
        }

        private void LogTrace(string message, params object[] args)
        {
            if (LogMessage != null)
            {
                LogMessage(this, new DevToolsSessionLogMessageEventArgs(DevToolsSessionLogLevel.Trace, message, args));
            }
        }

        private void LogError(string message, params object[] args)
        {
            if (LogMessage != null)
            {
                LogMessage(this, new DevToolsSessionLogMessageEventArgs(DevToolsSessionLogLevel.Error, message, args));
            }
        }

        #region IDisposable Support
        private bool m_isDisposed = false;

        protected void Dispose(bool disposing)
        {
            if (!m_isDisposed)
            {
                if (disposing)
                {
                    if (m_sessionSocket != null)
                    {
                        if (m_receiveTask != null)
                        {
                            if (m_sessionSocket.State == WebSocketState.Open)
                            {
                                try
                                {
                                    // Since Chromium-based DevTools does not respond to the close
                                    // request with a correctly echoed WebSocket close packet, but
                                    // rather just terminates the socket connection, so we have to
                                    // catch the exception thrown when the socket is terminated
                                    // unexpectedly. Also, because we are using async, waiting for
                                    // the task to complete might throw a TaskCanceledException,
                                    // which we should also catch. Additiionally, there are times
                                    // when mulitple failure modes can be seen, which will throw an
                                    // AggregateException, consolidating several exceptions into one,
                                    // and this too must be caught. Finally, the call to CloseAsync
                                    // will hang even though  the connection is already severed.
                                    // Wait for the task to complete for a short time (since we're
                                    // restricted to localhost, the default of 2 seconds should be
                                    // plenty; if not, change the initialization of the timout),
                                    // and if the task is still running, then we assume the connection
                                    // is properly closed.
                                    Task closeTask = Task.Run(() => m_sessionSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None));
                                    closeTask.Wait(m_closeConnectionWaitTimeSpan);
                                }
                                catch (WebSocketException)
                                {
                                }
                                catch (TaskCanceledException)
                                {
                                }
                                catch (AggregateException)
                                {
                                }
                            }

                            // Wait for the recieve task to be completely exited (for
                            // whatever reason) before attempting to dispose it.
                            m_receiveTask.Wait();
                            m_receiveTask.Dispose();
                            m_receiveTask = null;
                        }

                        m_sessionSocket.Dispose();
                        m_sessionSocket = null;
                    }

                    m_pendingCommands.Clear();
                }

                m_isDisposed = true;
            }
        }

        /// <summary>
        /// Disposes of the DevToolsSession and frees all resources.
        ///</summary>
        public void Dispose()
        {
            Dispose(true);
        }
        #endregion
    }
}
