// <copyright file="DevToolsSession.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using OpenQA.Selenium.Internal.Logging;
using System;
using System.Collections.Concurrent;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools;

/// <summary>
/// Represents a WebSocket connection to a running DevTools instance that can be used to send
/// commands and receive events.
///</summary>
[RequiresUnreferencedCode(CDP_AOTIncompatibilityMessage)]
[RequiresDynamicCode(CDP_AOTIncompatibilityMessage)]
public class DevToolsSession : IDevToolsSession
{
    internal const string CDP_AOTIncompatibilityMessage = "CDP is not compatible with trimming or AOT.";

    /// <summary>
    /// A value indicating that the version of the DevTools protocol in use
    /// by the browser should be automatically detected.
    /// </summary>
    public const int AutoDetectDevToolsProtocolVersion = 0;

    private readonly string debuggerEndpoint;
    private readonly TimeSpan openConnectionWaitTimeSpan = TimeSpan.FromSeconds(30);
    private readonly TimeSpan closeConnectionWaitTimeSpan = TimeSpan.FromSeconds(2);

    private bool isDisposed = false;
    private string? attachedTargetId;

    private WebSocketConnection? connection;
    private ConcurrentDictionary<long, DevToolsCommandData> pendingCommands = new ConcurrentDictionary<long, DevToolsCommandData>();
    private readonly BlockingCollection<string> messageQueue = new BlockingCollection<string>();
    private readonly Task messageQueueMonitorTask;
    private long currentCommandId = 0;
    private readonly DevToolsOptions options;

    private readonly static ILogger logger = Internal.Logging.Log.GetLogger<DevToolsSession>();

    /// <summary>
    /// Initializes a new instance of the DevToolsSession class, using the specified WebSocket endpoint and specified DevTools options.
    /// </summary>
    /// <param name="endpointAddress"></param>
    /// <param name="options"></param>
    /// <exception cref="ArgumentNullException">If <paramref name="options"/> is <see langword="null"/>, or <paramref name="endpointAddress"/> is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public DevToolsSession(string endpointAddress, DevToolsOptions options)
    {
        if (string.IsNullOrWhiteSpace(endpointAddress))
        {
            throw new ArgumentNullException(nameof(endpointAddress));
        }

        this.options = options ?? throw new ArgumentNullException(nameof(options));
        this.CommandTimeout = TimeSpan.FromSeconds(30);
        this.debuggerEndpoint = endpointAddress;
        if (endpointAddress.StartsWith("ws", StringComparison.InvariantCultureIgnoreCase))
        {
            this.EndpointAddress = endpointAddress;
        }
        this.messageQueueMonitorTask = Task.Run(() => this.MonitorMessageQueue());
    }

    /// <summary>
    /// Event raised when the DevToolsSession logs informational messages.
    /// </summary>
    public event EventHandler<DevToolsSessionLogMessageEventArgs>? LogMessage;

    /// <summary>
    /// Event raised an event notification is received from the DevTools session.
    /// </summary>
    public event EventHandler<DevToolsEventReceivedEventArgs>? DevToolsEventReceived;

    /// <summary>
    /// Gets or sets the time to wait for a command to complete. Default is 30 seconds.
    /// </summary>
    public TimeSpan CommandTimeout { get; set; }

    /// <summary>
    /// Gets or sets the active session ID of the connection.
    /// </summary>
    public string? ActiveSessionId { get; private set; }

    /// <summary>
    /// Gets the endpoint address of the session.
    /// </summary>
    public string? EndpointAddress { get; private set; }

    /// <summary>
    /// Gets the version-independent domain implementation for this Developer Tools connection
    /// </summary>
    public DevToolsDomains Domains { get; private set; } = null!; // TODO handle nullability for this

    /// <summary>
    /// Gets the version-specific implementation of domains for this DevTools session.
    /// </summary>
    /// <typeparam name="T">
    /// A <see cref="DevToolsSessionDomains"/> object containing the version-specific DevTools Protocol domain implementations.</typeparam>
    /// <returns>The version-specific DevTools Protocol domain implementation.</returns>
    /// <exception cref="InvalidOperationException">If the provided <typeparamref name="T"/> is not the right protocol version which is running.</exception>
    public T GetVersionSpecificDomains<T>() where T : DevToolsSessionDomains
    {
        if (this.Domains.VersionSpecificDomains is not T versionSpecificDomains)
        {
            string errorTemplate = "The type is invalid for conversion. You requested domains of type '{0}', but the version-specific domains for this session are '{1}'";
            string exceptionMessage = string.Format(CultureInfo.InvariantCulture, errorTemplate, typeof(T).ToString(), this.Domains.GetType().ToString());
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
    /// <exception cref="ArgumentNullException">If <paramref name="command"/> is <see langword="null"/>.</exception>
    public async Task<ICommandResponse<TCommand>?> SendCommand<TCommand>(TCommand command, CancellationToken cancellationToken = default, int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        where TCommand : ICommand
    {
        if (command == null)
        {
            throw new ArgumentNullException(nameof(command));
        }

        JsonNode commandParameters = JsonSerializer.SerializeToNode(command) ?? throw new InvalidOperationException("Command serialized to \"null\".");
        var result = await SendCommand(command.CommandName, commandParameters, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived).ConfigureAwait(false);

        if (result == null)
        {
            return null;
        }

        if (!this.Domains.VersionSpecificDomains.ResponseTypeMap.TryGetCommandResponseType<TCommand>(out Type? commandResponseType))
        {
            throw new InvalidOperationException($"Type {command.GetType()} does not correspond to a known command response type.");
        }

        return result.Value.Deserialize(commandResponseType) as ICommandResponse<TCommand>;
    }

    /// <summary>
    /// Sends the specified command and returns the associated command response.
    /// </summary>
    /// <typeparam name="TCommand">A command object implementing the <see cref="ICommand"/> interface.</typeparam>
    /// <param name="command">The command to be sent.</param>
    /// <param name="sessionId">The target session of the command</param>
    /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the command.</param>
    /// <param name="millisecondsTimeout">The execution timeout of the command in milliseconds.</param>
    /// <param name="throwExceptionIfResponseNotReceived"><see langword="true"/> to throw an exception if a response is not received; otherwise, <see langword="false"/>.</param>
    /// <returns>The command response object implementing the <see cref="ICommandResponse{T}"/> interface.</returns>
    public async Task<ICommandResponse<TCommand>?> SendCommand<TCommand>(TCommand command, string sessionId, CancellationToken cancellationToken = default, int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        where TCommand : ICommand
    {
        if (command == null)
        {
            throw new ArgumentNullException(nameof(command));
        }

        JsonNode commandParameters = JsonSerializer.SerializeToNode(command) ?? throw new InvalidOperationException("Command serialized to \"null\".");
        var result = await SendCommand(command.CommandName, sessionId, commandParameters, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived).ConfigureAwait(false);

        if (result == null)
        {
            return null;
        }

        if (!this.Domains.VersionSpecificDomains.ResponseTypeMap.TryGetCommandResponseType(command, out Type? commandResponseType))
        {
            throw new InvalidOperationException($"Type {typeof(TCommand)} does not correspond to a known command response type.");
        }

        return result.Value.Deserialize(commandResponseType) as ICommandResponse<TCommand>;
    }

    /// <summary>
    /// Sends the specified command and returns the associated command response.
    /// </summary>
    /// <typeparam name="TCommand">A command object implementing the <see cref="ICommand"/> interface.</typeparam>
    /// <typeparam name="TCommandResponse">A response object implementing the <see cref="ICommandResponse"/> interface.</typeparam>
    /// <param name="command">The command to send.</param>
    /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the command.</param>
    /// <param name="millisecondsTimeout">The execution timeout of the command in milliseconds.</param>
    /// <param name="throwExceptionIfResponseNotReceived"><see langword="true"/> to throw an exception if a response is not received; otherwise, <see langword="false"/>.</param>
    /// <returns>The command response object implementing the <see cref="ICommandResponse{T}"/> interface.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="command"/> is <see langword="null"/>.</exception>
    public async Task<TCommandResponse?> SendCommand<TCommand, TCommandResponse>(TCommand command, CancellationToken cancellationToken = default, int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        where TCommand : ICommand
        where TCommandResponse : ICommandResponse<TCommand>
    {
        if (command == null)
        {
            throw new ArgumentNullException(nameof(command));
        }

        JsonNode commandParameters = JsonSerializer.SerializeToNode(command) ?? throw new InvalidOperationException("Command serialized to \"null\".");
        var result = await SendCommand(command.CommandName, commandParameters, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived).ConfigureAwait(false);

        if (result == null)
        {
            return default;
        }

        return result.Value.Deserialize<TCommandResponse>();
    }

    /// <summary>
    /// Returns a JsonNode based on a command created with the specified command name and params.
    /// </summary>
    /// <param name="commandName">The name of the command to send.</param>
    /// <param name="commandParameters">The parameters of the command as a JsonNode object</param>
    /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the command.</param>
    /// <param name="millisecondsTimeout">The execution timeout of the command in milliseconds.</param>
    /// <param name="throwExceptionIfResponseNotReceived"><see langword="true"/> to throw an exception if a response is not received; otherwise, <see langword="false"/>.</param>
    /// <returns>The command response object implementing the <see cref="ICommandResponse{T}"/> interface.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="commandName"/> is <see langword="null"/>.</exception>
    public async Task<JsonElement?> SendCommand(string commandName, JsonNode commandParameters, CancellationToken cancellationToken = default, int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
    {
        if (this.attachedTargetId == null)
        {
            LogTrace("Session not currently attached to a target; reattaching");
            await this.InitializeSession().ConfigureAwait(false);
        }

        return await SendCommand(commandName, this.ActiveSessionId, commandParameters, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
    }

    /// <summary>
    /// Returns a JsonNode based on a command created with the specified command name and params.
    /// </summary>
    /// <param name="commandName">The name of the command to send.</param>
    /// <param name="sessionId">The sessionId of the command.</param>
    /// <param name="commandParameters">The parameters of the command as a JsonNode object</param>
    /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the command.</param>
    /// <param name="millisecondsTimeout">The execution timeout of the command in milliseconds.</param>
    /// <param name="throwExceptionIfResponseNotReceived"><see langword="true"/> to throw an exception if a response is not received; otherwise, <see langword="false"/>.</param>
    /// <returns>The command response object implementing the <see cref="ICommandResponse{T}"/> interface.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="commandName"/> is <see langword="null"/>.</exception>
    public async Task<JsonElement?> SendCommand(string commandName, string? sessionId, JsonNode commandParameters, CancellationToken cancellationToken = default, int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
    {
        millisecondsTimeout ??= Convert.ToInt32(CommandTimeout.TotalMilliseconds);

        var message = new DevToolsCommandData(Interlocked.Increment(ref this.currentCommandId), sessionId, commandName, commandParameters);

        if (this.connection != null && this.connection.IsActive)
        {
            if (logger.IsEnabled(LogEventLevel.Trace))
            {
                logger.Trace($"CDP SND >> {message.CommandId} {message.CommandName}: {commandParameters.ToJsonString()}");
            }

            LogTrace("Sending {0} {1}: {2}", message.CommandId, message.CommandName, commandParameters.ToString());

            string contents = JsonSerializer.Serialize(message);
            this.pendingCommands.TryAdd(message.CommandId, message);
            await this.connection.SendData(contents).ConfigureAwait(false);

            var responseWasReceived = message.SyncEvent.Wait(millisecondsTimeout.Value, cancellationToken);

            if (!responseWasReceived && throwExceptionIfResponseNotReceived)
            {
                throw new InvalidOperationException($"A command response was not received: {commandName}, timeout: {millisecondsTimeout.Value}ms");
            }

            if (this.pendingCommands.TryRemove(message.CommandId, out DevToolsCommandData? modified))
            {
                if (modified.IsError)
                {
                    var errorMessage = modified.Result.GetProperty("message").GetString();
                    var errorData = modified.Result.TryGetProperty("data", out var data) ? data.GetString() : null;

                    var exceptionMessage = $"{commandName}: {errorMessage}";
                    if (!string.IsNullOrWhiteSpace(errorData))
                    {
                        exceptionMessage = $"{exceptionMessage} - {errorData}";
                    }

                    LogTrace("Received Error Response {0}: {1} {2}", modified.CommandId, message, errorData);
                    throw new CommandResponseException(exceptionMessage)
                    {
                        Code = modified.Result.TryGetProperty("code", out var code) ? code.GetInt64() : -1
                    };
                }

                return modified.Result;
            }
        }
        else
        {
            LogTrace("WebSocket is not connected; not sending {0}", message.CommandName);
        }

        return null;
    }

    /// <summary>
    /// Releases all resources associated with this <see cref="DevToolsSession"/>.
    /// </summary>
    public void Dispose()
    {
        this.Dispose(true);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Asynchronously starts the session.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation.</returns>
    internal async Task StartSession()
    {
        int requestedProtocolVersion = options.ProtocolVersion ?? AutoDetectDevToolsProtocolVersion;
        int protocolVersion = await InitializeProtocol(requestedProtocolVersion).ConfigureAwait(false);
        this.Domains = DevToolsDomains.InitializeDomains(protocolVersion, this);

        await this.InitializeSocketConnection().ConfigureAwait(false);
        await this.InitializeSession().ConfigureAwait(false);
        try
        {
            // Wrap this in a try-catch, because it's not the end of the
            // world if clearing the log doesn't work.
            await this.Domains.Log.Clear().ConfigureAwait(false);
            LogTrace("Log cleared.", this.attachedTargetId);
        }
        catch (WebDriverException)
        {
        }
    }

    /// <summary>
    /// Asynchronously stops the session.
    /// </summary>
    /// <param name="manualDetach"><see langword="true"/> to manually detach the session
    /// from its attached target; otherwise <see langword="false"/>.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    internal async Task StopSession(bool manualDetach)
    {
        if (this.attachedTargetId != null)
        {
            this.Domains.Target.TargetDetached -= this.OnTargetDetached;
            string? sessionId = this.ActiveSessionId;
            this.ActiveSessionId = null;
            if (manualDetach)
            {
                await this.Domains.Target.DetachFromTarget(sessionId, this.attachedTargetId).ConfigureAwait(false);
            }

            this.attachedTargetId = null;
        }
    }

    /// <summary>
    /// Releases all resources associated with this <see cref="DevToolsSession"/>.
    /// </summary>
    /// <param name="disposing"><see langword="true"/> if the Dispose method was explicitly called; otherwise, <see langword="false"/>.</param>
    protected void Dispose(bool disposing)
    {
        if (!this.isDisposed)
        {
            if (disposing)
            {
                this.Domains.Target.TargetDetached -= this.OnTargetDetached;
                this.pendingCommands.Clear();
                Task.Run(async () => await this.TerminateSocketConnection()).GetAwaiter().GetResult();
            }

            this.isDisposed = true;
        }
    }

    private async Task<int> InitializeProtocol(int requestedProtocolVersion)
    {
        int protocolVersion = requestedProtocolVersion;
        if (this.EndpointAddress == null)
        {
            string debuggerUrl = string.Format(CultureInfo.InvariantCulture, "http://{0}", this.debuggerEndpoint);
            string rawVersionInfo;
            using (HttpClient client = new HttpClient())
            {
                client.BaseAddress = new Uri(debuggerUrl);
                rawVersionInfo = await client.GetStringAsync("/json/version").ConfigureAwait(false);
            }

            var versionInfo = JsonSerializer.Deserialize<DevToolsVersionInfo>(rawVersionInfo) ?? throw new JsonException("/json/version endpoint returned null response");
            this.EndpointAddress = versionInfo.WebSocketDebuggerUrl;

            if (requestedProtocolVersion == AutoDetectDevToolsProtocolVersion)
            {
                if (!int.TryParse(versionInfo.BrowserMajorVersion, out protocolVersion))
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

        return protocolVersion;
    }

    private async Task InitializeSession()
    {
        LogTrace("Creating session");
        if (this.attachedTargetId == null)
        {
            // Set the attached target ID to a "pending connection" value
            // (any non-null will do, so we choose the empty string), so
            // that when getting the available targets, we won't
            // recursively try to call InitializeSession.
            this.attachedTargetId = "";
            var targets = await this.Domains.Target.GetTargets().ConfigureAwait(false);
            foreach (var target in targets)
            {
                if (target.Type == "page")
                {
                    this.attachedTargetId = target.TargetId;
                    LogTrace("Found Target ID {0}.", this.attachedTargetId);
                    break;
                }
            }
        }

        if (this.attachedTargetId == "")
        {
            this.attachedTargetId = null;
            throw new WebDriverException("Unable to find target to attach to, no targets of type 'page' available");
        }

        string sessionId = await this.Domains.Target.AttachToTarget(this.attachedTargetId).ConfigureAwait(false);
        LogTrace("Target ID {0} attached. Active session ID: {1}", this.attachedTargetId, sessionId);
        this.ActiveSessionId = sessionId;

        await this.Domains.Target.SetAutoAttach().ConfigureAwait(false);
        LogTrace("AutoAttach is set.", this.attachedTargetId);

        // The Target domain needs to send Session-less commands! Else the waitForDebugger setting in setAutoAttach won't work!
        if (options.WaitForDebuggerOnStart)
        {
            var setAutoAttachCommand = Domains.Target.CreateSetAutoAttachCommand(true);
            var setDiscoverTargetsCommand = Domains.Target.CreateDiscoverTargetsCommand();

            await SendCommand(setAutoAttachCommand, string.Empty, default, null, true).ConfigureAwait(false);
            await SendCommand(setDiscoverTargetsCommand, string.Empty, default, null, true).ConfigureAwait(false);
        }

        this.Domains.Target.TargetDetached += this.OnTargetDetached;
    }

    private void OnTargetDetached(object? sender, TargetDetachedEventArgs e)
    {
        if (e.SessionId == this.ActiveSessionId && e.TargetId == this.attachedTargetId)
        {
            Task.Run(async () => await this.StopSession(false)).GetAwaiter().GetResult();
        }
    }

    private async Task InitializeSocketConnection()
    {
        LogTrace("Creating WebSocket");
        this.connection = new WebSocketConnection(this.openConnectionWaitTimeSpan, this.closeConnectionWaitTimeSpan);
        connection.DataReceived += OnConnectionDataReceived;
        await connection.Start(this.EndpointAddress!).ConfigureAwait(false);
        LogTrace("WebSocket created");
    }

    private async Task TerminateSocketConnection()
    {
        LogTrace("Closing WebSocket");
        if (this.connection != null && this.connection.IsActive)
        {
            await this.connection.Stop().ConfigureAwait(false);
            await this.ShutdownMessageQueue(this.connection).ConfigureAwait(false);
        }
        LogTrace("WebSocket closed");
    }

    private async Task ShutdownMessageQueue(WebSocketConnection connection)
    {
        // THe WebSocket connection is always closed before this method
        // is called, so there will eventually be no more data written
        // into the message queue, meaning this loop should be guaranteed
        // to complete.
        while (connection.IsActive)
        {
            await Task.Delay(TimeSpan.FromMilliseconds(10));
        }

        this.messageQueue.CompleteAdding();
        await this.messageQueueMonitorTask.ConfigureAwait(false);
    }

    private void MonitorMessageQueue()
    {
        // GetConsumingEnumerable blocks until if BlockingCollection.IsCompleted
        // is false (i.e., is still able to be written to), and there are no items
        // in the collection. Once any items are added to the collection, the method
        // unblocks and we can process any items in the collection at that moment.
        // Once IsCompleted is true, the method unblocks with no items in returned
        // in the IEnumerable, meaning the foreach loop will terminate gracefully.
        foreach (string message in this.messageQueue.GetConsumingEnumerable())
        {
            // Don't break entire thread in case of unsuccessful message,
            // and give a chance for the next message in queue to be processed
            try
            {
                this.ProcessMessage(message);
            }
            catch (Exception ex)
            {
                if (logger.IsEnabled(LogEventLevel.Error))
                {
                    logger.Error($"Unexpected error occurred while processing message: {ex}");
                }

                LogError("Unexpected error occurred while processing message: {0}", ex);
            }
        }
    }

    private void ProcessMessage(string message)
    {
        if (logger.IsEnabled(LogEventLevel.Trace))
        {
            logger.Trace($"CDP RCV << {message}");
        }

        JsonElement messageObject;
        using (var doc = JsonDocument.Parse(message))
        {
            messageObject = doc.RootElement.Clone();
        }

        if (messageObject.TryGetProperty("id", out var idProperty))
        {
            long commandId = idProperty.GetInt64();

            if (this.pendingCommands.TryGetValue(commandId, out DevToolsCommandData? commandInfo))
            {
                if (messageObject.TryGetProperty("error", out var errorProperty))
                {
                    commandInfo.IsError = true;
                    commandInfo.Result = errorProperty;
                }
                else
                {
                    commandInfo.Result = messageObject.GetProperty("result");
                    LogTrace("Received Response {0}: {1}", commandId, commandInfo.Result.ToString());
                }

                commandInfo.SyncEvent.Set();
            }
            else
            {
                if (logger.IsEnabled(LogEventLevel.Error))
                {
                    logger.Error($"Received Unknown Response {commandId}: {message}");
                }

                LogError("Received Unknown Response {0}: {1}", commandId, message);
            }

            return;
        }

        if (messageObject.TryGetProperty("method", out var methodProperty))
        {
            var method = methodProperty.GetString() ?? throw new InvalidOperationException("CDP message contained \"method\" property with a value of \"null\".");
            var methodParts = method.Split(new char[] { '.' }, 2);
            var eventData = messageObject.GetProperty("params");

            LogTrace("Received Event {0}: {1}", method, eventData.ToString());

            // Dispatch the event on a new thread so that any event handlers
            // responding to the event will not block this thread from processing
            // DevTools commands that may be sent in the body of the attached
            // event handler. If thread pool starvation seems to become a problem,
            // we can switch to a channel-based queue.
            Task.Run(() =>
            {
                try
                {
                    OnDevToolsEventReceived(new DevToolsEventReceivedEventArgs(methodParts[0], methodParts[1], eventData));
                }
                catch (Exception ex)
                {
                    if (logger.IsEnabled(LogEventLevel.Warn))
                    {
                        logger.Warn($"CDP VNT ^^ Unhandled error occurred in event handler of '{method}' method. {ex}");
                    }

                    throw;
                }
            });

            return;
        }

        LogTrace("Received Other: {0}", message);
    }

    private void OnDevToolsEventReceived(DevToolsEventReceivedEventArgs e)
    {
        if (DevToolsEventReceived != null)
        {
            DevToolsEventReceived(this, e);
        }
    }

    private void OnConnectionDataReceived(object? sender, WebSocketConnectionDataReceivedEventArgs e)
    {
        this.messageQueue.Add(e.Data);
    }

    private void LogTrace(string message, params object?[] args)
    {
        if (LogMessage != null)
        {
            LogMessage(this, new DevToolsSessionLogMessageEventArgs(DevToolsSessionLogLevel.Trace, message, args));
        }
    }

    private void LogError(string message, params object?[] args)
    {
        if (LogMessage != null)
        {
            LogMessage(this, new DevToolsSessionLogMessageEventArgs(DevToolsSessionLogLevel.Error, message, args));
        }
    }
}
