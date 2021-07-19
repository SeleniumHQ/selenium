// <copyright file="DevToolsSession.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.Concurrent;
using System.ComponentModel;
using System.Globalization;
using System.IO;
using System.Net.Http;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Represents a WebSocket connection to a running DevTools instance that can be used to send 
    /// commands and recieve events.
    ///</summary>
    public class DevToolsSession : IDevToolsSession
    {
        public const int AutoDetectDevToolsProtocolVersion = 0;

        private readonly string debuggerEndpoint;
        private string websocketAddress;
        private readonly TimeSpan closeConnectionWaitTimeSpan = TimeSpan.FromSeconds(2);

        private ClientWebSocket sessionSocket;
        private ConcurrentDictionary<long, DevToolsCommandData> pendingCommands = new ConcurrentDictionary<long, DevToolsCommandData>();
        private long currentCommandId = 0;

        private DevToolsDomains domains;

        private Task receiveTask;

        /// <summary>
        /// Initializes a new instance of the DevToolsSession class, using the specified WebSocket endpoint.
        /// </summary>
        /// <param name="endpointAddress"></param>
        public DevToolsSession(string endpointAddress)
        {
            if (String.IsNullOrWhiteSpace(endpointAddress))
            {
                throw new ArgumentNullException(nameof(endpointAddress));
            }

            CommandTimeout = TimeSpan.FromSeconds(5);
            this.debuggerEndpoint = endpointAddress;
            if (endpointAddress.StartsWith("ws:"))
            {
                this.websocketAddress = endpointAddress;
            }

            sessionSocket = new ClientWebSocket();
            sessionSocket.Options.KeepAliveInterval = TimeSpan.Zero;
        }

        /// <summary>
        /// Event raised when the DevToolsSession logs informational messages.
        /// </summary>
        public event EventHandler<DevToolsSessionLogMessageEventArgs> LogMessage;

        /// <summary>
        /// Event raised an event notification is received from the DevTools session.
        /// </summary>
        public event EventHandler<DevToolsEventReceivedEventArgs> DevToolsEventReceived;

        /// <summary>
        /// Gets or sets the time to wait for a command to complete. Default is 5 seconds.
        /// </summary>
        public TimeSpan CommandTimeout { get; set; }

        /// <summary>
        /// Gets or sets the active session ID of the connection.
        /// </summary>
        public string ActiveSessionId { get; set; }

        /// <summary>
        /// Gets the endpoint address of the session.
        /// </summary>
        public string EndpointAddress => this.websocketAddress;

        /// <summary>
        /// Gets the version-independent domain implementation for this Developer Tools connection
        /// </summary>
        public DevToolsDomains Domains => this.domains;

        /// <summary>
        /// Gets the version-specific implementation of domains for this DevTools session.
        /// </summary>
        /// <typeparam name="T">
        /// A <see cref="DevToolsSessionDomains"/> object containing the version-specific DevTools Protocol domain implementations.</typeparam>
        /// <returns>The version-specific DevTools Protocol domain implementation.</returns>
        public T GetVersionSpecificDomains<T>() where T: DevToolsSessionDomains
        {
            T versionSpecificDomains = this.domains.VersionSpecificDomains as T;
            if (versionSpecificDomains == null)
            {
                string errorTemplate = "The type is invalid for conversion. You requested domains of type '{0}', but the version-specific domains for this session are '{1}'";
                string exceptionMessage = string.Format(CultureInfo.InvariantCulture, errorTemplate, typeof(T).ToString(), this.domains.GetType().ToString());
                throw new InvalidOperationException(exceptionMessage);
            }

            return versionSpecificDomains;
        }

        /// <summary>
        /// Sends the specified command and returns the associated command response.
        /// </summary>
        /// <typeparam name="TCommand">A command object implementing the <see cref="ICommand"/> interface.</typeparam>
        /// <param name="command">The command to be sent.</param>
        /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the command.</param>
        /// <param name="millisecondsTimeout">The execution timeout of the command in milliseconds.</param>
        /// <param name="throwExceptionIfResponseNotReceived"><see langword="true"/> to throw an exception if a response is not received; otherwise, <see langword="false"/>.</param>
        /// <returns>The command response object implementing the <see cref="ICommandResponse{T}"/> interface.</returns>
        public async Task<ICommandResponse<TCommand>> SendCommand<TCommand>(TCommand command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
            where TCommand : ICommand
        {
            if (command == null)
            {
                throw new ArgumentNullException(nameof(command));
            }

            var result = await SendCommand(command.CommandName, JToken.FromObject(command), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);

            if (result == null)
            {
                return null;
            }

            if (!this.domains.VersionSpecificDomains.ResponseTypeMap.TryGetCommandResponseType<TCommand>(out Type commandResponseType))
            {
                throw new InvalidOperationException($"Type {typeof(TCommand)} does not correspond to a known command response type.");
            }

            return result.ToObject(commandResponseType) as ICommandResponse<TCommand>;
        }

        /// <summary>
        /// Sends the specified command and returns the associated command response.
        /// </summary>
        /// <typeparam name="TCommand"></typeparam>
        /// <typeparam name="TCommandResponse"></typeparam>
        /// <typeparam name="TCommand">A command object implementing the <see cref="ICommand"/> interface.</typeparam>
        /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the command.</param>
        /// <param name="millisecondsTimeout">The execution timeout of the command in milliseconds.</param>
        /// <param name="throwExceptionIfResponseNotReceived"><see langword="true"/> to throw an exception if a response is not received; otherwise, <see langword="false"/>.</param>
        /// <returns>The command response object implementing the <see cref="ICommandResponse{T}"/> interface.</returns>
        public async Task<TCommandResponse> SendCommand<TCommand, TCommandResponse>(TCommand command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
            where TCommand : ICommand
            where TCommandResponse : ICommandResponse<TCommand>
        {
            if (command == null)
            {
                throw new ArgumentNullException(nameof(command));
            }

            var result = await SendCommand(command.CommandName, JToken.FromObject(command), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);

            if (result == null)
            {
                return default(TCommandResponse);
            }

            return result.ToObject<TCommandResponse>();
        }

        /// <summary>
        /// Returns a JToken based on a command created with the specified command name and params.
        /// </summary>
        /// <param name="commandName">The name of the command to send.</param>
        /// <param name="params">The parameters of the command as a JToken object</param>
        /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the command.</param>
        /// <param name="millisecondsTimeout">The execution timeout of the command in milliseconds.</param>
        /// <param name="throwExceptionIfResponseNotReceived"><see langword="true"/> to throw an exception if a response is not received; otherwise, <see langword="false"/>.</param>
        /// <returns>The command response object implementing the <see cref="ICommandResponse{T}"/> interface.</returns>
        //[DebuggerStepThrough]
        public async Task<JToken> SendCommand(string commandName, JToken @params, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            var message = new DevToolsCommandData(Interlocked.Increment(ref currentCommandId), ActiveSessionId, commandName, @params);

            if (millisecondsTimeout.HasValue == false)
            {
                millisecondsTimeout = Convert.ToInt32(CommandTimeout.TotalMilliseconds);
            }

            await OpenSessionConnection(cancellationToken);

            LogTrace("Sending {0} {1}: {2}", message.CommandId, message.CommandName, @params.ToString());
            
            var contents = JsonConvert.SerializeObject(message);
            var contentBuffer = Encoding.UTF8.GetBytes(contents);

            pendingCommands.TryAdd(message.CommandId, message);
            await sessionSocket.SendAsync(new ArraySegment<byte>(contentBuffer), WebSocketMessageType.Text, true, cancellationToken);

            var responseWasReceived = await Task.Run(() => message.SyncEvent.Wait(millisecondsTimeout.Value, cancellationToken));

            if (!responseWasReceived && throwExceptionIfResponseNotReceived)
            {
                throw new InvalidOperationException($"A command response was not received: {commandName}");
            }

            DevToolsCommandData modified;
            if (pendingCommands.TryRemove(message.CommandId, out modified))
            {
                if (modified.IsError)
                {
                    var errorMessage = modified.Result.Value<string>("message");
                    var errorData = modified.Result.Value<string>("data");

                    var exceptionMessage = $"{commandName}: {errorMessage}";
                    if (!string.IsNullOrWhiteSpace(errorData))
                    {
                        exceptionMessage = $"{exceptionMessage} - {errorData}";
                    }

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

        /// <summary>
        /// Asynchronously starts the session.
        /// </summary>
        /// <param name="protocolVersion">The version of the protocol to use in communicating with the browswer.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        internal async Task Start(int protocolVersion)
        {
            if (this.websocketAddress == null)
            {
                string debuggerUrl = string.Format(CultureInfo.InvariantCulture, "http://{0}", this.debuggerEndpoint);
                string rawVersionInfo = string.Empty;
                using (HttpClient client = new HttpClient())
                {
                    client.BaseAddress = new Uri(debuggerUrl);
                    rawVersionInfo = await client.GetStringAsync("/json/version");
                }

                var versionInfo = JsonConvert.DeserializeObject<DevToolsVersionInfo>(rawVersionInfo);
                this.websocketAddress = versionInfo.WebSocketDebuggerUrl;

                if (protocolVersion == AutoDetectDevToolsProtocolVersion)
                {
                    bool versionParsed = int.TryParse(versionInfo.BrowserMajorVersion, out protocolVersion);
                    if (!versionParsed)
                    {
                        throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Unable to parse version number received from browser. Reported browser version string is '{0}'", versionInfo.Browser));
                    }
                }
            }
            else
            {
                if (protocolVersion == AutoDetectDevToolsProtocolVersion)
                {
                    throw new WebDriverException("A WebSocket address for DevTools protocol has been detected, but the protocol version cannot be automatically detected. You must specify a protocol version.");
                }
            }

            this.domains = DevToolsDomains.InitializeDomains(protocolVersion, this);

            string targetId = null;
            var targets = await this.domains.Target.GetTargets();
            foreach(var target in targets)
            {
                if (target.Type == "page")
                {
                    targetId = target.TargetId;
                    LogTrace("Found Target ID {0}.", targetId);
                    string sessionId = await this.domains.Target.AttachToTarget(targetId);
                    LogTrace("Target ID {0} attached. Active session ID: {1}", targetId, sessionId);
                    this.ActiveSessionId = sessionId;
                    break;
                }
            }

            await this.domains.Target.SetAutoAttach();
            LogTrace("AutoAttach is set.", targetId);
            try
            {
                // Wrap this in a try-catch, because it's not the end of the
                // world if clearing the log doesn't work.
                await this.domains.Log.Clear();
                LogTrace("Log cleared.", targetId);
            }
            catch (WebDriverException)
            {
            }
        }

        private async Task OpenSessionConnection(CancellationToken cancellationToken)
        {
            if (sessionSocket == null)
            {
                return;
            }

            // Try to prevent "System.InvalidOperationException: The WebSocket has already been started."
            while (sessionSocket.State == WebSocketState.Connecting)
            {
                if (cancellationToken.IsCancellationRequested)
                {
                    return;
                }

                await Task.Delay(10);
            }

            if (sessionSocket.State != WebSocketState.Open)
            {
                await sessionSocket.ConnectAsync(new Uri(websocketAddress), cancellationToken);

                receiveTask = Task.Run(async () => await ReceiveMessage(cancellationToken));
            }
        }

        private async Task ReceiveMessage(CancellationToken cancellationToken)
        {
            while (sessionSocket.State == WebSocketState.Open)
            {
                WebSocketReceiveResult result = null;
                var buffer = WebSocket.CreateClientBuffer(1024, 1024);
                try
                {
                    result = await sessionSocket.ReceiveAsync(buffer, cancellationToken);
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
                            result = await sessionSocket.ReceiveAsync(buffer, cancellationToken);
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
                if (pendingCommands.TryGetValue(commandId, out commandInfo))
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
        private bool isDisposed = false;

        protected void Dispose(bool disposing)
        {
            if (!isDisposed)
            {
                if (disposing)
                {
                    if (sessionSocket != null)
                    {
                        if (receiveTask != null)
                        {
                            if (sessionSocket.State == WebSocketState.Open)
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
                                    // will hang even though the connection is already severed.
                                    // Wait for the task to complete for a short time (since we're
                                    // restricted to localhost, the default of 2 seconds should be
                                    // plenty; if not, change the initialization of the timout),
                                    // and if the task is still running, then we assume the connection
                                    // is properly closed.
                                    Task closeTask = Task.Run(() => sessionSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None));
                                    closeTask.Wait(closeConnectionWaitTimeSpan);
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
                            receiveTask.Wait();
                            receiveTask.Dispose();
                            receiveTask = null;
                        }

                        sessionSocket.Dispose();
                        sessionSocket = null;
                    }

                    pendingCommands.Clear();
                }

                isDisposed = true;
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
