// <copyright file="HttpCommandExecutor.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way of executing Commands over HTTP
    /// </summary>
    internal class HttpCommandExecutor : ICommandExecutor
    {
        private const string JsonMimeType = "application/json";
        private const string ContentTypeHeader = JsonMimeType + ";charset=utf-8";
        private const string RequestAcceptHeader = JsonMimeType + ", image/png";
        private Uri remoteServerUri;
        private TimeSpan serverResponseTimeout;
        private bool enableKeepAlive;

        /// <summary>
        /// Initializes a new instance of the HttpCommandExecutor class
        /// </summary>
        /// <param name="addressOfRemoteServer">Address of the WebDriver Server</param>
        /// <param name="timeout">The timeout within which the server must respond.</param>
        public HttpCommandExecutor(Uri addressOfRemoteServer, TimeSpan timeout)
            : this(addressOfRemoteServer, timeout, true)
        {
        }

        /// <summary>
        /// Initializes a new instance of the HttpCommandExecutor class
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

            ServicePointManager.Expect100Continue = false;

            // In the .NET Framework, HttpWebRequest responses with an error code are limited
            // to 64k by default. Since the remote server error responses include a screenshot,
            // they can frequently exceed this size. This only applies to the .NET Framework;
            // Mono does not implement the property.
            if (Type.GetType("Mono.Runtime", false, true) == null)
            {
                HttpWebRequest.DefaultMaximumErrorResponseLength = -1;
            }
        }

        #region ICommandExecutor Members
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

            CommandInfo info = CommandInfoRepository.Instance.GetCommandInfo(commandToExecute.Name);
            HttpWebRequest request = info.CreateWebRequest(this.remoteServerUri, commandToExecute);
            request.Timeout = (int)this.serverResponseTimeout.TotalMilliseconds;
            request.Accept = RequestAcceptHeader;
            request.KeepAlive = this.enableKeepAlive;
            request.ServicePoint.ConnectionLimit = 2000;
            if (request.Method == CommandInfo.PostCommand)
            {
                string payload = commandToExecute.ParametersAsJsonString;
                byte[] data = Encoding.UTF8.GetBytes(payload);
                request.ContentType = ContentTypeHeader;
                System.IO.Stream requestStream = request.GetRequestStream();
                requestStream.Write(data, 0, data.Length);
                requestStream.Close();
            }

            return CreateResponse(request);
        }

        private static Response CreateResponse(WebRequest request)
        {
            Response commandResponse = new Response();

            HttpWebResponse webResponse = null;
            try
            {
                webResponse = (HttpWebResponse)request.GetResponse();
            }
            catch (WebException ex)
            {
                webResponse = (HttpWebResponse)ex.Response;
            }

            if (webResponse == null)
            {
                throw new WebDriverException("No response from server for url " + request.RequestUri.AbsoluteUri);
            }
            else
            {
                string responseString = GetTextOfWebResponse(webResponse);

                if (webResponse.ContentType != null && webResponse.ContentType.StartsWith(JsonMimeType, StringComparison.OrdinalIgnoreCase))
                {
                    commandResponse = Response.FromJson(responseString);
                }
                else
                {
                    commandResponse.Value = responseString;
                }

                if (webResponse.StatusCode < HttpStatusCode.OK || webResponse.StatusCode >= HttpStatusCode.BadRequest)
                {
                    // 4xx represents an unknown command or a bad request.
                    if (webResponse.StatusCode >= HttpStatusCode.BadRequest && webResponse.StatusCode < HttpStatusCode.InternalServerError)
                    {
                        commandResponse.Status = WebDriverResult.UnhandledError;
                    }
                    else if (webResponse.StatusCode >= HttpStatusCode.InternalServerError)
                    {
                        // 5xx represents an internal server error. The response status should already be set, but
                        // if not, set it to a general error code. The exception is a 501 (NotImplemented) response,
                        // which indicates that the command hasn't been implemented on the server.
                        if (webResponse.StatusCode == HttpStatusCode.NotImplemented)
                        {
                            commandResponse.Status = WebDriverResult.UnknownCommand;
                        }
                        else
                        {
                            if (commandResponse.Status == WebDriverResult.Success)
                            {
                                commandResponse.Status = WebDriverResult.UnhandledError;
                            }
                        }
                    }
                    else
                    {
                        commandResponse.Status = WebDriverResult.UnhandledError;
                    }
                }

                if (commandResponse.Value is string)
                {
                    // First, collapse all \r\n pairs to \n, then replace all \n with
                    // System.Environment.NewLine. This ensures the consistency of 
                    // the values.
                    commandResponse.Value = ((string)commandResponse.Value).Replace("\r\n", "\n").Replace("\n", System.Environment.NewLine);
                }
            }

            return commandResponse;
        }

        #endregion

        private static string GetTextOfWebResponse(HttpWebResponse webResponse)
        {
            // StreamReader.Close also closes the underlying stream.
            Stream responseStream = webResponse.GetResponseStream();
            StreamReader responseStreamReader = new StreamReader(responseStream, Encoding.UTF8);
            string responseString = responseStreamReader.ReadToEnd();
            responseStreamReader.Close();

            // The response string from the Java remote server has trailing null
            // characters. This is due to the fix for issue 288.
            if (responseString.IndexOf('\0') >= 0)
            {
                responseString = responseString.Substring(0, responseString.IndexOf('\0'));
            }

            return responseString;
        }
    }
}
