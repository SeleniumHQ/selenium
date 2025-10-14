// <copyright file="HttpCommandExecutor.cs" company="Selenium Committers">
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

using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Internal.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Remote;

/// <summary>
/// Provides a way of executing Commands over HTTP
/// </summary>
public class HttpCommandExecutor : ICommandExecutor
{
    private const string JsonMimeType = "application/json";
    private const string PngMimeType = "image/png";
    private const string Utf8CharsetType = "utf-8";
    private const string RequestAcceptHeader = JsonMimeType + ", " + PngMimeType;
    private const string RequestContentTypeHeader = JsonMimeType + "; charset=" + Utf8CharsetType;
    private const string UserAgentHeaderTemplate = "selenium/{0} (.net {1})";
    private readonly Uri remoteServerUri;
    private readonly TimeSpan serverResponseTimeout;
    private bool isDisposed;
    private CommandInfoRepository commandInfoRepository = new W3CWireProtocolCommandInfoRepository();
    private readonly Lazy<HttpClient> client;

    private static readonly ILogger _logger = Log.GetLogger<HttpCommandExecutor>();

    /// <summary>
    /// Initializes a new instance of the <see cref="HttpCommandExecutor"/> class
    /// </summary>
    /// <param name="addressOfRemoteServer">Address of the WebDriver Server</param>
    /// <param name="timeout">The timeout within which the server must respond.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="addressOfRemoteServer"/> is <see langword="null"/>.</exception>
    public HttpCommandExecutor(Uri addressOfRemoteServer, TimeSpan timeout)
        : this(addressOfRemoteServer, timeout, true)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="HttpCommandExecutor"/> class
    /// </summary>
    /// <param name="addressOfRemoteServer">Address of the WebDriver Server</param>
    /// <param name="timeout">The timeout within which the server must respond.</param>
    /// <param name="enableKeepAlive"><see langword="true"/> if the KeepAlive header should be sent
    /// with HTTP requests; otherwise, <see langword="false"/>.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="addressOfRemoteServer"/> is <see langword="null"/>.</exception>
    public HttpCommandExecutor(Uri addressOfRemoteServer, TimeSpan timeout, bool enableKeepAlive)
    {
        if (addressOfRemoteServer == null)
        {
            throw new ArgumentNullException(nameof(addressOfRemoteServer), "You must specify a remote address to connect to");
        }

        if (!addressOfRemoteServer.AbsoluteUri.EndsWith("/", StringComparison.OrdinalIgnoreCase))
        {
            addressOfRemoteServer = new Uri(addressOfRemoteServer.ToString() + "/");
        }

        this.UserAgent = string.Format(CultureInfo.InvariantCulture, UserAgentHeaderTemplate, ResourceUtilities.ProductVersion, ResourceUtilities.PlatformFamily);
        this.remoteServerUri = addressOfRemoteServer;
        this.serverResponseTimeout = timeout;
        this.IsKeepAliveEnabled = enableKeepAlive;
        this.client = new Lazy<HttpClient>(CreateHttpClient);
    }

    /// <summary>
    /// Occurs when the <see cref="HttpCommandExecutor"/> is sending an HTTP
    /// request to the remote end WebDriver implementation.
    /// </summary>
    public event EventHandler<SendingRemoteHttpRequestEventArgs>? SendingRemoteHttpRequest;

    /// <summary>
    /// Gets or sets an <see cref="IWebProxy"/> object to be used to proxy requests
    /// between this <see cref="HttpCommandExecutor"/> and the remote end WebDriver
    /// implementation.
    /// </summary>
    public IWebProxy? Proxy { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether keep-alive is enabled for HTTP
    /// communication between this <see cref="HttpCommandExecutor"/> and the
    /// remote end WebDriver implementation.
    /// </summary>
    public bool IsKeepAliveEnabled { get; set; }

    /// <summary>
    /// Gets or sets the user agent string used for HTTP communication
    /// between this <see cref="HttpCommandExecutor"/> and the remote end
    /// WebDriver implementation
    /// </summary>
    public string UserAgent { get; set; }

    /// <summary>
    /// Gets the repository of objects containing information about commands.
    /// </summary>
    /// <exception cref="ArgumentNullException">If the value is set to <see langword="null"/>.</exception>
    protected CommandInfoRepository CommandInfoRepository
    {
        get => this.commandInfoRepository;
        set => this.commandInfoRepository = value ?? throw new ArgumentNullException(nameof(value), "CommandInfoRepository cannot be null");
    }

    /// <summary>
    /// Attempts to add a command to the repository of commands known to this executor.
    /// </summary>
    /// <param name="commandName">The name of the command to attempt to add.</param>
    /// <param name="info">The <see cref="CommandInfo"/> describing the command to add.</param>
    /// <returns><see langword="true"/> if the new command has been added successfully; otherwise, <see langword="false"/>.</returns>
    public bool TryAddCommand(string commandName, [NotNullWhen(true)] CommandInfo? info)
    {
        if (info is not HttpCommandInfo commandInfo)
        {
            return false;
        }

        return this.commandInfoRepository.TryAddCommand(commandName, commandInfo);
    }

    /// <summary>
    /// Executes a command.
    /// </summary>
    /// <param name="commandToExecute">The command you wish to execute.</param>
    /// <returns>A response from the browser.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="commandToExecute"/> is <see langword="null"/>.</exception>
    public virtual Response Execute(Command commandToExecute)
    {
        return Task.Run(() => this.ExecuteAsync(commandToExecute)).GetAwaiter().GetResult();
    }

    /// <summary>
    /// Executes a command as an asynchronous task.
    /// </summary>
    /// <param name="commandToExecute">The command you wish to execute.</param>
    /// <returns>A task object representing the asynchronous operation.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="commandToExecute"/> is <see langword="null"/>.</exception>
    public virtual async Task<Response> ExecuteAsync(Command commandToExecute)
    {
        if (commandToExecute == null)
        {
            throw new ArgumentNullException(nameof(commandToExecute), "commandToExecute cannot be null");
        }

        if (_logger.IsEnabled(LogEventLevel.Debug))
        {
            _logger.Debug($"Executing command: [{commandToExecute.SessionId}]: {commandToExecute.Name}");
        }

        HttpCommandInfo? info = this.commandInfoRepository.GetCommandInfo<HttpCommandInfo>(commandToExecute.Name);
        if (info == null)
        {
            throw new NotImplementedException(string.Format("The command you are attempting to execute, {0}, does not exist in the protocol dialect used by the remote end.", commandToExecute.Name));
        }

        HttpRequestInfo requestInfo = new HttpRequestInfo(this.remoteServerUri, commandToExecute, info);
        HttpResponseInfo responseInfo;
        try
        {
            responseInfo = await this.MakeHttpRequest(requestInfo).ConfigureAwait(false);
        }
        catch (HttpRequestException ex)
        {
            string unknownErrorMessage = "An unknown exception was encountered sending an HTTP request to the remote WebDriver server for URL {0}. The exception message was: {1}";
            throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, unknownErrorMessage, requestInfo.FullUri.AbsoluteUri, ex.Message), ex);
        }
        catch (TaskCanceledException ex)
        {
            string timeoutMessage = "The HTTP request to the remote WebDriver server for URL {0} timed out after {1} seconds.";
            throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, timeoutMessage, requestInfo.FullUri.AbsoluteUri, this.serverResponseTimeout.TotalSeconds), ex);
        }

        Response toReturn = this.CreateResponse(responseInfo);

        if (_logger.IsEnabled(LogEventLevel.Debug))
        {
            _logger.Debug($"Response: {toReturn}");
        }

        return toReturn;
    }

    /// <summary>
    /// Raises the <see cref="SendingRemoteHttpRequest"/> event.
    /// </summary>
    /// <param name="eventArgs">A <see cref="SendingRemoteHttpRequestEventArgs"/> that contains the event data.</param>
    protected virtual void OnSendingRemoteHttpRequest(SendingRemoteHttpRequestEventArgs eventArgs)
    {
        if (eventArgs == null)
        {
            throw new ArgumentNullException(nameof(eventArgs), "eventArgs must not be null");
        }

        this.SendingRemoteHttpRequest?.Invoke(this, eventArgs);
    }

    /// <summary>
    /// Creates an instance of <see cref="HttpClientHandler"/> as underlying handler,
    /// used by <see cref="CreateHttpClient"/>. Invoked only once when required.
    /// </summary>
    /// <returns>An instance of <see cref="HttpClientHandler"/>.</returns>
    protected virtual HttpClientHandler CreateHttpClientHandler()
    {
        HttpClientHandler httpClientHandler = new();

        string userInfo = this.remoteServerUri.UserInfo;

        if (!string.IsNullOrEmpty(userInfo) && userInfo.Contains(':'))
        {
            string[] userInfoComponents = this.remoteServerUri.UserInfo.Split([':'], 2);
            httpClientHandler.Credentials = new NetworkCredential(userInfoComponents[0], userInfoComponents[1]);
            httpClientHandler.PreAuthenticate = true;
        }

        httpClientHandler.Proxy = this.Proxy;

        return httpClientHandler;
    }

    /// <summary>
    /// Creates an instance of <see cref="HttpClient"/> used by making all HTTP calls to remote end.
    /// Invoked only once when required.
    /// </summary>
    /// <returns>An instance of <see cref="HttpClient"/>.</returns>
    protected virtual HttpClient CreateHttpClient()
    {
        var httpClientHandler = CreateHttpClientHandler()
            ?? throw new InvalidOperationException($"{nameof(CreateHttpClientHandler)} method returned null");

        HttpMessageHandler handler = httpClientHandler;

        if (_logger.IsEnabled(LogEventLevel.Trace))
        {
            handler = new DiagnosticsHttpHandler(httpClientHandler, _logger);
        }

        var client = new HttpClient(handler);

        client.DefaultRequestHeaders.UserAgent.ParseAdd(this.UserAgent);
        client.DefaultRequestHeaders.Accept.ParseAdd(RequestAcceptHeader);
        client.DefaultRequestHeaders.ExpectContinue = false;

        if (!this.IsKeepAliveEnabled)
        {
            client.DefaultRequestHeaders.Connection.ParseAdd("close");
        }

        client.Timeout = this.serverResponseTimeout;

        return client;
    }

    private async Task<HttpResponseInfo> MakeHttpRequest(HttpRequestInfo requestInfo)
    {
        SendingRemoteHttpRequestEventArgs eventArgs = new SendingRemoteHttpRequestEventArgs(requestInfo.HttpMethod, requestInfo.FullUri.ToString(), requestInfo.RequestBody);
        this.OnSendingRemoteHttpRequest(eventArgs);

        HttpMethod method = new HttpMethod(requestInfo.HttpMethod);
        using (HttpRequestMessage requestMessage = new HttpRequestMessage(method, requestInfo.FullUri))
        {
            foreach (KeyValuePair<string, string> header in eventArgs.Headers)
            {
                requestMessage.Headers.Add(header.Key, header.Value);
            }

            if (requestInfo.HttpMethod == HttpCommandInfo.GetCommand)
            {
                CacheControlHeaderValue cacheControlHeader = new CacheControlHeaderValue();
                cacheControlHeader.NoCache = true;
                requestMessage.Headers.CacheControl = cacheControlHeader;
            }

            if (requestInfo.HttpMethod == HttpCommandInfo.PostCommand)
            {
                MediaTypeWithQualityHeaderValue acceptHeader = new MediaTypeWithQualityHeaderValue(JsonMimeType);
                acceptHeader.CharSet = Utf8CharsetType;
                requestMessage.Headers.Accept.Add(acceptHeader);

                byte[] bytes = Encoding.UTF8.GetBytes(requestInfo.RequestBody);
                requestMessage.Content = new ByteArrayContent(bytes, 0, bytes.Length);

                MediaTypeHeaderValue contentTypeHeader = new MediaTypeHeaderValue(JsonMimeType);
                contentTypeHeader.CharSet = Utf8CharsetType;
                requestMessage.Content.Headers.ContentType = contentTypeHeader;
            }

            using (HttpResponseMessage responseMessage = await this.client.Value.SendAsync(requestMessage).ConfigureAwait(false))
            {
                var responseBody = await responseMessage.Content.ReadAsStringAsync().ConfigureAwait(false);
                var responseContentType = responseMessage.Content.Headers.ContentType?.ToString();
                var responseStatusCode = responseMessage.StatusCode;

                return new HttpResponseInfo(responseBody, responseContentType, responseStatusCode);
            }
        }
    }

    private Response CreateResponse(HttpResponseInfo responseInfo)
    {
        Response response;
        string body = responseInfo.Body;
        if ((int)responseInfo.StatusCode < 200 || (int)responseInfo.StatusCode > 299)
        {
            if (responseInfo.ContentType != null && responseInfo.ContentType.StartsWith(JsonMimeType, StringComparison.OrdinalIgnoreCase))
            {
                response = Response.FromErrorJson(body);
            }
            else
            {
                response = new Response(sessionId: null, body, WebDriverResult.UnknownError);
            }
        }
        else if (responseInfo.ContentType != null && responseInfo.ContentType.StartsWith(JsonMimeType, StringComparison.OrdinalIgnoreCase))
        {
            response = Response.FromJson(body);
        }
        else
        {
            response = new Response(sessionId: null, body, WebDriverResult.Success);
        }

        if (response.Value is string valueString)
        {
            valueString = valueString.Replace("\r\n", "\n").Replace("\n", Environment.NewLine);
            response = new Response(response.SessionId, valueString, response.Status);
        }

        return response;
    }

    /// <summary>
    /// Releases all resources used by the <see cref="HttpCommandExecutor"/>.
    /// </summary>
    public void Dispose()
    {
        this.Dispose(true);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Releases the unmanaged resources used by the <see cref="HttpCommandExecutor"/> and
    /// optionally releases the managed resources.
    /// </summary>
    /// <param name="disposing"><see langword="true"/> to release managed and resources;
    /// <see langword="false"/> to only release unmanaged resources.</param>
    protected virtual void Dispose(bool disposing)
    {
        if (!this.isDisposed)
        {
            if (this.client.IsValueCreated)
            {
                this.client.Value.Dispose();
            }

            this.isDisposed = true;
        }
    }

    private class HttpRequestInfo
    {
        public HttpRequestInfo(Uri serverUri, Command commandToExecute, HttpCommandInfo commandInfo)
        {
            if (commandInfo is null)
            {
                throw new ArgumentNullException(nameof(commandInfo));
            }

            this.FullUri = commandInfo.CreateCommandUri(serverUri, commandToExecute);
            this.HttpMethod = commandInfo.Method;
            this.RequestBody = commandToExecute.ParametersAsJsonString;
        }

        public Uri FullUri { get; set; }
        public string HttpMethod { get; set; }
        public string RequestBody { get; set; }
    }

    private class HttpResponseInfo
    {
        public HttpResponseInfo(string body, string? contentType, HttpStatusCode statusCode)
        {
            this.Body = body ?? throw new ArgumentNullException(nameof(body));
            this.ContentType = contentType;
            this.StatusCode = statusCode;
        }

        public HttpStatusCode StatusCode { get; set; }
        public string Body { get; set; }
        public string? ContentType { get; set; }
    }

    /// <summary>
    /// Internal diagnostic handler to log http requests/responses.
    /// </summary>
    private class DiagnosticsHttpHandler : DelegatingHandler
    {
        private readonly ILogger _logger;

        public DiagnosticsHttpHandler(HttpMessageHandler messageHandler, ILogger logger)
            : base(messageHandler)
        {
            if (messageHandler is null)
            {
                throw new ArgumentNullException(nameof(messageHandler));
            }

            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Sends the specified request and returns the associated response.
        /// </summary>
        /// <param name="request">The request to be sent.</param>
        /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the request.</param>
        /// <returns>The http response message content.</returns>
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            StringBuilder requestLogMessageBuilder = new();
            requestLogMessageBuilder.AppendFormat(">> {0} {1}",
                request.Method,
                request.RequestUri?.ToString() ?? "null");

            if (request.Content is not null)
            {
#if NET8_0_OR_GREATER
                var requestContent = await request.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
#else
                var requestContent = await request.Content.ReadAsStringAsync().ConfigureAwait(false);
#endif
                requestLogMessageBuilder.AppendFormat("{0}{1}", Environment.NewLine, requestContent);
            }

            _logger.Trace(requestLogMessageBuilder.ToString());

            var response = await base.SendAsync(request, cancellationToken).ConfigureAwait(false);

            StringBuilder responseLogMessageBuilder = new();

            responseLogMessageBuilder.AppendFormat("<< {0} {1}", (int)response.StatusCode, response.ReasonPhrase);

            if (!response.IsSuccessStatusCode && response.Content != null)
            {
#if NET8_0_OR_GREATER
                var responseContent = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
#else
                var responseContent = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
#endif

                responseLogMessageBuilder.AppendFormat("{0}{1}", Environment.NewLine, responseContent);
            }

            _logger.Trace(responseLogMessageBuilder.ToString());

            return response;
        }
    }
}
