using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way of executing Commands over HTTP
    /// </summary>
    public class HttpCommandExecutor : ICommandExecutor
    {
        private Dictionary<DriverCommand, CommandInfo> commandDictionary = new Dictionary<DriverCommand, CommandInfo>();
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

            remoteServerUri = addressOfRemoteServer;
            PopulateCommandDictionary();
        }

        #region ICommandExecutor Members
        /// <summary>
        /// Executes a command
        /// </summary>
        /// <param name="commandToExecute">The command you wish to execute</param>
        /// <returns>A response from the browser</returns>
        public Response Execute(Command commandToExecute)
        {
            CommandInfo info = commandDictionary[commandToExecute.Name];
            HttpWebRequest.DefaultMaximumErrorResponseLength = -1;
            HttpWebRequest request = info.CreateWebRequest(remoteServerUri, commandToExecute);
            request.Timeout = 15000;
            request.Accept = "application/json, image/png";
            if (request.Method == CommandInfo.PostCommand)
            {
                string payload = commandToExecute.ParametersAsJsonString;
                byte[] data = Encoding.UTF8.GetBytes(payload);
                request.ContentType = "application/json";
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

                if (webResponse.ContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase))
                {
                    commandResponse = JsonConvert.DeserializeObject<Response>(responseString);
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

        private void PopulateCommandDictionary()
        {
            commandDictionary.Add(DriverCommand.DefineDriverMapping, new CommandInfo(CommandInfo.PostCommand, "/config/drivers"));
            commandDictionary.Add(DriverCommand.NewSession, new CommandInfo(CommandInfo.PostCommand, "/session"));
            commandDictionary.Add(DriverCommand.GetSessionCapabilities, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId"));
            commandDictionary.Add(DriverCommand.Quit, new CommandInfo(CommandInfo.DeleteCommand, "/session/:sessionId"));
            commandDictionary.Add(DriverCommand.GetCurrentWindowHandle, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/window_handle"));
            commandDictionary.Add(DriverCommand.GetWindowHandles, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/window_handles"));
            commandDictionary.Add(DriverCommand.GetCurrentUrl, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/url"));
            commandDictionary.Add(DriverCommand.Get, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/url"));
            commandDictionary.Add(DriverCommand.GoForward, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/forward"));
            commandDictionary.Add(DriverCommand.GoBack, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/back"));
            commandDictionary.Add(DriverCommand.Refresh, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/refresh"));
            commandDictionary.Add(DriverCommand.GetSpeed, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/speed"));
            commandDictionary.Add(DriverCommand.SetSpeed, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/speed"));
            commandDictionary.Add(DriverCommand.ExecuteScript, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/execute"));
            commandDictionary.Add(DriverCommand.Screenshot, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/screenshot"));
            commandDictionary.Add(DriverCommand.SwitchToFrame, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/frame"));
            commandDictionary.Add(DriverCommand.SwitchToWindow, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/window"));
            commandDictionary.Add(DriverCommand.GetAllCookies, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/cookie"));
            commandDictionary.Add(DriverCommand.AddCookie, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/cookie"));
            commandDictionary.Add(DriverCommand.DeleteAllCookies, new CommandInfo(CommandInfo.DeleteCommand, "/session/:sessionId/cookie"));
            commandDictionary.Add(DriverCommand.DeleteCookie, new CommandInfo(CommandInfo.DeleteCommand, "/session/:sessionId/cookie/:name"));
            commandDictionary.Add(DriverCommand.GetPageSource, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/source"));
            commandDictionary.Add(DriverCommand.GetTitle, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/title"));
            commandDictionary.Add(DriverCommand.FindElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element"));
            commandDictionary.Add(DriverCommand.FindElements, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/elements"));
            commandDictionary.Add(DriverCommand.GetActiveElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element/active"));
            commandDictionary.Add(DriverCommand.FindChildElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element/:id/element"));
            commandDictionary.Add(DriverCommand.FindChildElements, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element/:id/elements"));
            commandDictionary.Add(DriverCommand.ClickElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element/:id/click"));
            commandDictionary.Add(DriverCommand.GetElementText, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/text"));
            commandDictionary.Add(DriverCommand.SubmitElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element/:id/submit"));
            commandDictionary.Add(DriverCommand.GetElementValue, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/value"));
            commandDictionary.Add(DriverCommand.SendKeysToElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element/:id/value"));
            commandDictionary.Add(DriverCommand.GetElementTagName, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/name"));
            commandDictionary.Add(DriverCommand.ClearElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element/:id/clear"));
            commandDictionary.Add(DriverCommand.IsElementSelected, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/selected"));
            commandDictionary.Add(DriverCommand.SetElementSelected, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element/:id/selected"));
            commandDictionary.Add(DriverCommand.ToggleElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element/:id/toggle"));
            commandDictionary.Add(DriverCommand.IsElementEnabled, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/enabled"));
            commandDictionary.Add(DriverCommand.IsElementDisplayed, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/displayed"));
            commandDictionary.Add(DriverCommand.GetElementLocation, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/location"));
            commandDictionary.Add(DriverCommand.GetElementLocationOnceScrolledIntoView, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/location_in_view"));
            commandDictionary.Add(DriverCommand.GetElementSize, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/size"));
            commandDictionary.Add(DriverCommand.GetElementValueOfCssProperty, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/css/:propertyName"));
            commandDictionary.Add(DriverCommand.GetElementAttribute, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/attribute/:name"));
            commandDictionary.Add(DriverCommand.ElementEquals, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/element/:id/equals/:other"));
            commandDictionary.Add(DriverCommand.HoverOverElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element/:id/hover"));
            commandDictionary.Add(DriverCommand.DragElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/element/:id/drag"));
            commandDictionary.Add(DriverCommand.Close, new CommandInfo(CommandInfo.DeleteCommand, "/session/:sessionId/window"));
            commandDictionary.Add(DriverCommand.SetBrowserVisible, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/visible"));
            commandDictionary.Add(DriverCommand.IsBrowserVisible, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/visible"));
        }

        /// <summary>
        /// Provides a way to get information from the command
        /// </summary>
        private class CommandInfo
        {
            /// <summary>
            /// POST verb for the command info
            /// </summary>
            public const string PostCommand = "POST";
            
            /// <summary>
            /// GET verb for the command info
            /// </summary>
            public const string GetCommand = "GET";
            
            /// <summary>
            /// DELETE verb for the command info
            /// </summary>
            public const string DeleteCommand = "DELETE";

            private string targetUrl;
            private string method;

            /// <summary>
            /// Initializes a new instance of the CommandInfo class
            /// </summary>
            /// <param name="method">Method of the Command</param>
            /// <param name="targetUrl">Url the command will be executed against</param>
            public CommandInfo(string method, string targetUrl)
            {
                this.targetUrl = targetUrl;
                this.method = method;
            }

            /// <summary>
            /// Creates a webrequest for your command
            /// </summary>
            /// <param name="baseUri">Uri that will have the command run against</param>
            /// <param name="commandToExecute">Command to execute</param>
            /// <returns>A web request of what has been run</returns>
            public HttpWebRequest CreateWebRequest(Uri baseUri, Command commandToExecute)
            {
                HttpWebRequest request = null;
                string[] urlParts = targetUrl.Split(new string[] { "/" }, StringSplitOptions.RemoveEmptyEntries);
                for (int i = 0; i < urlParts.Length; i++)
                {
                    string urlPart = urlParts[i];
                    if (urlPart.StartsWith(":", StringComparison.OrdinalIgnoreCase))
                    {
                        urlParts[i] = GetCommandPropertyValue(urlPart, commandToExecute);
                    }
                }

                string relativeUrl = string.Join("/", urlParts);
                Uri fullUri;
                bool uriCreateSucceeded = Uri.TryCreate(baseUri, relativeUrl, out fullUri);
                if (uriCreateSucceeded)
                {
                    request = HttpWebRequest.Create(fullUri) as HttpWebRequest;
                    request.Method = method;
                }
                else
                {
                    throw new InvalidOperationException(string.Format(CultureInfo.InvariantCulture, "Unable to create URI from base {0} and relative path {1}", baseUri.ToString(), relativeUrl));
                }

                return request;
            }

            private static string GetCommandPropertyValue(string propertyName, Command commandToExecute)
            {
                string propertyValue = string.Empty;

                // Strip the leading colon
                propertyName = propertyName.Substring(1);

                if (propertyName == "sessionId")
                {
                    if (commandToExecute.SessionId != null)
                    {
                        propertyValue = commandToExecute.SessionId.ToString();
                    }
                }
                else if (commandToExecute.Parameters != null && commandToExecute.Parameters.Count > 0)
                {
                    // Extract the URL parameter, and remove it from the parameters dictionary
                    // so it doesn't get transmitted as a JSON parameter.
                    if (commandToExecute.Parameters.ContainsKey(propertyName))
                    {
                        if (commandToExecute.Parameters[propertyName] != null)
                        {
                            propertyValue = commandToExecute.Parameters[propertyName].ToString();
                            commandToExecute.Parameters.Remove(propertyName);
                        }
                    }
                }

                return propertyValue;
            }
        }
    }
}
