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

using System;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using OpenQA.Selenium.Internal;

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
        private bool enableKeepAlive;
        private bool isDisposed;
        private IWebProxy proxy;
        private CommandInfoRepository commandInfoRepository = new W3CWireProtocolCommandInfoRepository();
        private HttpClient client;

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
                throw new ArgumentNullException("addressOfRemoteServer", "You must specify a remote address to connect to");
            }

            if (!addressOfRemoteServer.AbsoluteUri.EndsWith("/", StringComparison.OrdinalIgnoreCase))
            {
                addressOfRemoteServer = new Uri(addressOfRemoteServer.ToString() + "/");
            }

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
        /// Gets the repository of objects containin information about commands.
        /// </summary>
        //public CommandInfoRepository CommandInfoRepository
        //{
        //    get { return this.commandInfoRepository; }
        //    protected set { this.commandInfoRepository = value; }
        //}

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
        /// Executes a command
        /// </summary>
        /// <param name="commandToExecute">The command you wish to execute</param>
        /// <returns>A response from the browser</returns>
        public virtual Response Execute(Command commandToExecute)
        {
            if (commandToExecute == null)
            {
                throw new ArgumentNullException("commandToExecute", "commandToExecute cannot be null");
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
                // Use TaskFactory to avoid deadlock in multithreaded implementations.
                responseInfo = new TaskFactory(CancellationToken.None,
                        TaskCreationOptions.None,
                        TaskContinuationOptions.None,
                        TaskScheduler.Default)
                    .StartNew(() => this.MakeHttpRequest(requestInfo))
                    .Unwrap()
                    .GetAwaiter()
                    .GetResult();
            }
            catch (HttpRequestException ex)
            {
                WebException innerWebException = ex.InnerException as WebException;
                if (innerWebException != null)
                {
                    if (innerWebException.Status == WebExceptionStatus.Timeout)
                    {
                        string timeoutMessage = "The HTTP request to the remote WebDriver server for URL {0} timed out after {1} seconds.";
                        throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, timeoutMessage, requestInfo.FullUri.AbsoluteUri, this.serverResponseTimeout.TotalSeconds), ex);
                    }
                    else if (innerWebException.Status == WebExceptionStatus.ConnectFailure)
                    {
                        string connectFailureMessage = "Could not connect to the remote WebDriver server for URL {0}.";
                        throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, connectFailureMessage, requestInfo.FullUri.AbsoluteUri, this.serverResponseTimeout.TotalSeconds), ex);
                    }
                    else if (innerWebException.Response == null)
                    {
                        string nullResponseMessage = "A exception with a null response was thrown sending an HTTP request to the remote WebDriver server for URL {0}. The status of the exception was {1}, and the message was: {2}";
                        throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, nullResponseMessage, requestInfo.FullUri.AbsoluteUri, innerWebException.Status, innerWebException.Message), innerWebException);
                    }
                }

                string unknownErrorMessage = "An unknown exception was encountered sending an HTTP request to the remote WebDriver server for URL {0}. The exception message was: {1}";
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, unknownErrorMessage, requestInfo.FullUri.AbsoluteUri, ex.Message), ex);
            }
            catch (TaskCanceledException ex)
            {
                string timeoutMessage = "The HTTP request to the remote WebDriver server for URL {0} timed out after {1} seconds.";
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, timeoutMessage, requestInfo.FullUri.AbsoluteUri, this.serverResponseTimeout.TotalSeconds), ex);
            }

            Response toReturn = this.CreateResponse(responseInfo);
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
                throw new ArgumentNullException("eventArgs", "eventArgs must not be null");
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

            this.client = new HttpClient(httpClientHandler);
            string userAgentString = string.Format(CultureInfo.InvariantCulture, UserAgentHeaderTemplate, ResourceUtilities.AssemblyVersion, ResourceUtilities.PlatformFamily);
            this.client.DefaultRequestHeaders.UserAgent.ParseAdd(userAgentString);

            this.client.DefaultRequestHeaders.Accept.ParseAdd(RequestAcceptHeader);
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

                using (HttpResponseMessage responseMessage = await this.client.SendAsync(requestMessage))
                {
                    HttpResponseInfo httpResponseInfo = new HttpResponseInfo();
                    httpResponseInfo.Body = await responseMessage.Content.ReadAsStringAsync();
                    httpResponseInfo.ContentType = responseMessage.Content.Headers.ContentType.ToString();
                    httpResponseInfo.StatusCode = responseMessage.StatusCode;

                    return httpResponseInfo;
                }
            }
        }

        private Response CreateResponse(HttpResponseInfo responseInfo)
        {
            Response response = new Response();
            string body = responseInfo.Body;
            if (responseInfo.ContentType != null && responseInfo.ContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase))
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
    }
}
