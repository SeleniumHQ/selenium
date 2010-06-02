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
    public class HttpCommandExecutor : ICommandExecutor
    {
        private const string JsonMimeType = "application/json";
        private const string RequestAcceptHeader = JsonMimeType + ", image/png";
        private Uri remoteServerUri;

        /// <summary>
        /// Initializes a new instance of the HttpCommandExecutor class
        /// </summary>
        /// <param name="addressOfRemoteServer">Address of the WebDriver Server</param>
        public HttpCommandExecutor(Uri addressOfRemoteServer)
        {
            if (addressOfRemoteServer == null)
            {
                throw new ArgumentNullException("addressOfRemoteServer", "You must specify a remote address to connect to");
            }

            if (!addressOfRemoteServer.AbsoluteUri.EndsWith("/"))
            {
                addressOfRemoteServer = new Uri(addressOfRemoteServer.ToString() + "/");
            }

            remoteServerUri = addressOfRemoteServer;
        }

        #region ICommandExecutor Members
        /// <summary>
        /// Executes a command
        /// </summary>
        /// <param name="commandToExecute">The command you wish to execute</param>
        /// <returns>A response from the browser</returns>
        public Response Execute(Command commandToExecute)
        {
            CommandInfo info = CommandInfoRepository.Instance.GetCommandInfo(commandToExecute.Name);
            HttpWebRequest.DefaultMaximumErrorResponseLength = -1;
            HttpWebRequest request = info.CreateWebRequest(remoteServerUri, commandToExecute);
            request.Timeout = 15000;
            request.Accept = RequestAcceptHeader;
            if (request.Method == CommandInfo.PostCommand)
            {
                string payload = commandToExecute.ParametersAsJsonString;
                byte[] data = Encoding.UTF8.GetBytes(payload);
                request.ContentType = JsonMimeType;
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

                if (webResponse.ContentType.StartsWith(JsonMimeType, StringComparison.OrdinalIgnoreCase))
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
                        commandResponse.Status = WebDriverResult.NotImplemented;
                    }
                    else if (webResponse.StatusCode >= HttpStatusCode.InternalServerError)
                    {
                        // 5xx represents an internal server error. The response status should already be set, but
                        // if not, set it to a general error code.
                        if (commandResponse.Status == WebDriverResult.Success)
                        {
                            commandResponse.Status = WebDriverResult.UnhandledError;
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
