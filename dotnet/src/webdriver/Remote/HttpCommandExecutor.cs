// <copyright file="HttpCommandExecutor.cs" company="WebDriver Committers">
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

using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Internal.Logging;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Remote
{
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
        private Uri remoteServerUri;
        private TimeSpan serverResponseTimeout;
        private string userAgent;
        private bool enableKeepAlive;
        private bool isDisposed;
        private IWebProxy proxy;
        private CommandInfoRepository commandInfoRepository = new W3CWireProtocolCommandInfoRepository();
        private HttpClient client;

        private static readonly ILogger _logger = Log.GetLogger<HttpCommandExecutor>();

        /// <summary>
        /// Initializes a new instance of the <see cref="HttpCommandExecutor"/> class
        /// </summary>
        /// <param name="addressOfRemoteServer">Address of the WebDriver Server</param>
        /// <param name="timeout">The timeout within which the server must respond.</param>
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

            this.userAgent = string.Format(CultureInfo.InvariantCulture, UserAgentHeaderTemplate, ResourceUtilities.ProductVersion, ResourceUtilities.PlatformFamily);
            this.remoteServerUri = addressOfRemoteServer;
            this.serverResponseTimeout = timeout;
            this.enableKeepAlive = enableKeepAlive;
        }

        /// <summary>
        /// Occurs when the <see cref="HttpCommandExecutor"/> is sending an HTTP
        /// request to the remote end WebDriver implementation.
        /// </summary>
        public event EventHandler<SendingRemoteHttpRequestEventArgs> SendingRemoteHttpRequest;

        /// <summary>
        /// Gets or sets an <see cref="IWebProxy"/> object to be used to proxy requests
        /// between this <see cref="HttpCommandExecutor"/> and the remote end WebDriver
        /// implementation.
        /// </summary>
        public IWebProxy Proxy
        {
            get { return this.proxy; }
            set { this.proxy = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether keep-alive is enabled for HTTP
        /// communication between this <see cref="HttpCommandExecutor"/> and the
        /// remote end WebDriver implementation.
        /// </summary>
        public bool IsKeepAliveEnabled
        {
            get { return this.enableKeepAlive; }
            set { this.enableKeepAlive = value; }
        }

        /// <summary>
        /// Gets or sets the user agent string used for HTTP communication
        /// batween this <see cref="HttpCommandExecutor"/> and the remote end
        /// WebDriver implementation
        /// </summary>
        public string UserAgent
        {
            get { return this.userAgent; }
            set { this.userAgent = value; }
        }

        /// <summary>
        /// Gets the repository of objects containing information about commands.
        /// </summary>
        protected CommandInfoRepository CommandInfoRepository
        {
            get { return this.commandInfoRepository; }
            set { this.commandInfoRepository = value; }
        }

        /// <summary>
        /// Attempts to add a command to the repository of commands known to this executor.
        /// </summary>
        /// <param name="commandName">The name of the command to attempt to add.</param>
        /// <param name="info">The <see cref="CommandInfo"/> describing the commnd to add.</param>
        /// <returns><see langword="true"/> if the new command has been added successfully; otherwise, <see langword="false"/>.</returns>
        public bool TryAddCommand(string commandName, CommandInfo info)
        {
            HttpCommandInfo commandInfo = info as HttpCommandInfo;
            if (commandInfo == null)
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
        public virtual Response Execute(Command commandToExecute)
        {
            return Task.Run(() => this.ExecuteAsync(commandToExecute)).GetAwaiter().GetResult();
        }

        /// <summary>
        /// Executes a command as an asynchronous task.
        /// </summary>
        /// <param name="commandToExecute">The command you wish to execute.</param>
        /// <returns>A task object representing the asynchronous operation.</returns>
        public virtual async Task<Response> ExecuteAsync(Command commandToExecute)
        {
            if (commandToExecute == null)
            {
                throw new ArgumentNullException(nameof(commandToExecute), "commandToExecute cannot be null");
            }

            if (_logger.IsEnabled(LogEventLevel.Debug))
            {
                _logger.Debug($"Executing command: {commandToExecute}");
            }

            HttpCommandInfo info = this.commandInfoRepository.GetCommandInfo<HttpCommandInfo>(commandToExecute.Name);
            if (info == null)
            {
                throw new NotImplementedException(string.Format("The command you are attempting to execute, {0}, does not exist in the protocol dialect used by the remote end.", commandToExecute.Name));
            }

            if (this.client == null)
            {
                this.CreateHttpClient();
            }

            HttpRequestInfo requestInfo = new HttpRequestInfo(this.remoteServerUri, commandToExecute, info);
            HttpResponseInfo responseInfo = null;
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

            if (this.SendingRemoteHttpRequest != null)
            {
                this.SendingRemoteHttpRequest(this, eventArgs);
            }
        }

        private void CreateHttpClient()
        {
            HttpClientHandler httpClientHandler = new HttpClientHandler();
            string userInfo = this.remoteServerUri.UserInfo;
            if (!string.IsNullOrEmpty(userInfo) && userInfo.Contains(":"))
            {
                string[] userInfoComponents = this.remoteServerUri.UserInfo.Split(new char[] { ':' }, 2);
                httpClientHandler.Credentials = new NetworkCredential(userInfoComponents[0], userInfoComponents[1]);
                httpClientHandler.PreAuthenticate = true;
            }

            httpClientHandler.Proxy = this.Proxy;

            HttpMessageHandler handler = httpClientHandler;

            if (_logger.IsEnabled(LogEventLevel.Trace))
            {
                handler = new DiagnosticsHttpHandler(httpClientHandler, _logger);
            }

            this.client = new HttpClient(handler);
            this.client.DefaultRequestHeaders.UserAgent.ParseAdd(this.UserAgent);
            this.client.DefaultRequestHeaders.Accept.ParseAdd(RequestAcceptHeader);
            this.client.DefaultRequestHeaders.ExpectContinue = false;
            if (!this.IsKeepAliveEnabled)
            {
                this.client.DefaultRequestHeaders.Connection.ParseAdd("close");
            }

            this.client.Timeout = this.serverResponseTimeout;
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

                    byte[] bytes = Encoding.UTF8.GetBytes(eventArgs.RequestBody);
                    requestMessage.Content = new ByteArrayContent(bytes, 0, bytes.Length);

                    MediaTypeHeaderValue contentTypeHeader = new MediaTypeHeaderValue(JsonMimeType);
                    contentTypeHeader.CharSet = Utf8CharsetType;
                    requestMessage.Content.Headers.ContentType = contentTypeHeader;
                }

                using (HttpResponseMessage responseMessage = await this.client.SendAsync(requestMessage).ConfigureAwait(false))
                {
                    HttpResponseInfo httpResponseInfo = new HttpResponseInfo();
                    httpResponseInfo.Body = await responseMessage.Content.ReadAsStringAsync().ConfigureAwait(false);
                    httpResponseInfo.ContentType = responseMessage.Content.Headers.ContentType?.ToString();
                    httpResponseInfo.StatusCode = responseMessage.StatusCode;

                    return httpResponseInfo;
                }
            }
        }

        private Response CreateResponse(HttpResponseInfo responseInfo)
        {
            Response response = new Response();
            string body = responseInfo.Body;
            if ((int)responseInfo.StatusCode < 200 || (int)responseInfo.StatusCode > 299)
            {
                if (responseInfo.ContentType != null && responseInfo.ContentType.StartsWith(JsonMimeType, StringComparison.OrdinalIgnoreCase))
                {
                    response = Response.FromErrorJson(body);
                }
                else
                {
                    response.Status = WebDriverResult.UnhandledError;
                    response.Value = body;
                }
            }
            else if (responseInfo.ContentType != null && responseInfo.ContentType.StartsWith(JsonMimeType, StringComparison.OrdinalIgnoreCase))
            {
                response = Response.FromJson(body);
            }
            else
            {
                response.Value = body;
            }

            if (response.Value is string)
            {
                response.Value = ((string)response.Value).Replace("\r\n", "\n").Replace("\n", Environment.NewLine);
            }

            return response;
        }

        /// <summary>
        /// Releases all resources used by the <see cref="HttpCommandExecutor"/>.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
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
                if (this.client != null)
                {
                    this.client.Dispose();
                }

                this.isDisposed = true;
            }
        }

        private class HttpRequestInfo
        {
            public HttpRequestInfo(Uri serverUri, Command commandToExecute, HttpCommandInfo commandInfo)
            {
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
            public HttpStatusCode StatusCode { get; set; }
            public string Body { get; set; }
            public string ContentType { get; set; }
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
                _logger = logger;
            }

            /// <summary>
            /// Sends the specified request and returns the associated response.
            /// </summary>
            /// <param name="request">The request to be sent.</param>
            /// <param name="cancellationToken">A CancellationToken object to allow for cancellation of the request.</param>
            /// <returns>The http response message content.</returns>
            protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                var responseTask = base.SendAsync(request, cancellationToken);

                StringBuilder requestLogMessageBuilder = new();
                requestLogMessageBuilder.AppendFormat(">> {0}", request);

                if (request.Content != null)
                {
                    var requestContent = await request.Content.ReadAsStringAsync().ConfigureAwait(false);
                    requestLogMessageBuilder.AppendFormat("{0}{1}", Environment.NewLine, requestContent);
                }

                _logger.Trace(requestLogMessageBuilder.ToString());

                var response = await responseTask.ConfigureAwait(false);

                StringBuilder responseLogMessageBuilder = new();
                responseLogMessageBuilder.AppendFormat("<< {0}", response);

                if (!response.IsSuccessStatusCode && response.Content != null)
                {
                    var responseContent = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                    responseLogMessageBuilder.AppendFormat("{0}{1}", Environment.NewLine, responseContent);
                }

                _logger.Trace(responseLogMessageBuilder.ToString());

                return response;
            }
        }
    }
}
