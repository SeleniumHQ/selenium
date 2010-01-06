using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace OpenQA.Selenium.Remote
{
    public class HttpCommandExecutor : ICommandExecutor
    {
        private Dictionary<DriverCommand, CommandInfo> commandDictionary = new Dictionary<DriverCommand, CommandInfo>();
        private Uri remoteServerUri = null;

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

        public Response Execute(Command commandToExecute)
        {
            CommandInfo info = commandDictionary[commandToExecute.Name];
            HttpWebRequest.DefaultMaximumErrorResponseLength = -1;
            HttpWebRequest request = info.CreateWebRequest(remoteServerUri, commandToExecute);
            request.Accept = "application/json, image/png";
            string payload = JsonConvert.SerializeObject(commandToExecute.Parameters, new JsonConverter[] {new PlatformJsonConverter(), new CookieJsonConverter(), new CharArrayJsonConverter()});
            if (request.Method == CommandInfo.PostCommand)
            {
                byte[] data = Encoding.UTF8.GetBytes(payload);
                request.ContentType = "application/json";
                request.KeepAlive = false;
                System.IO.Stream requestStream = request.GetRequestStream();
                requestStream.Write(data, 0, data.Length);
                requestStream.Close();
            }
            return CreateResponse(request);
        }

        private static Response CreateResponse(WebRequest request)
        {
            Response commandResponse = new Response();
            int sessionIdUrlPosition = request.RequestUri.ToString().IndexOf("/session/", StringComparison.OrdinalIgnoreCase);
            if (sessionIdUrlPosition >= 0)
            {
                sessionIdUrlPosition += "/session/".Length;
                int nextSlashPosition = request.RequestUri.ToString().IndexOf("/", sessionIdUrlPosition, StringComparison.OrdinalIgnoreCase);
                if (nextSlashPosition < 0)
                {
                    nextSlashPosition = request.RequestUri.ToString().Length;
                }
                commandResponse.SessionId = request.RequestUri.ToString().Substring(sessionIdUrlPosition, nextSlashPosition - sessionIdUrlPosition);
            }
            // Context is obsolete. Add a dummy value.
            commandResponse.Context = "foo";

            HttpWebResponse webResponse = null;
            try
            {
                webResponse = (HttpWebResponse)request.GetResponse();
            }
            catch (WebException ex)
            {
                webResponse = (HttpWebResponse)ex.Response;
            }
            string responseString = GetTextOfWebResponse(webResponse);
            if (webResponse.ContentType.StartsWith("application/json", StringComparison.OrdinalIgnoreCase))
            {
                commandResponse = JsonConvert.DeserializeObject<Response>(responseString);
            }
            else
            {
                commandResponse.Value = webResponse.StatusDescription;
            }
            commandResponse.IsError = (webResponse.StatusCode < HttpStatusCode.OK || webResponse.StatusCode >= HttpStatusCode.MultipleChoices);
            if (commandResponse.Value is string)
            {
                // First, collapse all \r\n pairs to \n, then replace all \n with
                // System.Environment.NewLine. This ensures the consistency of 
                // the values.
                commandResponse.Value = (((string)commandResponse.Value).Replace("\r\n", "\n").Replace("\n", System.Environment.NewLine));
            }
            return commandResponse;
        }

        #endregion

        private static string GetTextOfWebResponse(HttpWebResponse webResponse)
        {
            System.IO.Stream responseStream = webResponse.GetResponseStream();
            System.IO.StreamReader responseStreamReader = new System.IO.StreamReader(responseStream, Encoding.UTF8);
            string responseString = responseStreamReader.ReadToEnd();
            responseStreamReader.Close();
            return responseString;
        }

        private void PopulateCommandDictionary()
        {
            commandDictionary.Add(DriverCommand.NewSession, new CommandInfo(CommandInfo.PostCommand, "/session"));
            commandDictionary.Add(DriverCommand.Quit, new CommandInfo(CommandInfo.DeleteCommand, "/session/:sessionId"));
            commandDictionary.Add(DriverCommand.GetCurrentWindowHandle, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/window_handle"));
            commandDictionary.Add(DriverCommand.GetWindowHandles, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/window_handles"));
            commandDictionary.Add(DriverCommand.Get, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/url"));
            commandDictionary.Add(DriverCommand.GoForward, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/forward"));
            commandDictionary.Add(DriverCommand.GoBack, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/back"));
            commandDictionary.Add(DriverCommand.Refresh, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/refresh"));
            commandDictionary.Add(DriverCommand.ExecuteScript, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/execute"));
            commandDictionary.Add(DriverCommand.GetCurrentUrl, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/url"));
            commandDictionary.Add(DriverCommand.GetTitle, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/title"));
            commandDictionary.Add(DriverCommand.GetPageSource, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/source"));
            commandDictionary.Add(DriverCommand.Screenshot, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/screenshot"));
            commandDictionary.Add(DriverCommand.SetBrowserVisible, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/visible"));
            commandDictionary.Add(DriverCommand.IsBrowserVisible, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/visible"));
            commandDictionary.Add(DriverCommand.FindElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element"));
            commandDictionary.Add(DriverCommand.FindElements, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/elements"));
            commandDictionary.Add(DriverCommand.GetActiveElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element/active"));
            commandDictionary.Add(DriverCommand.FindChildElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element/:id/element/:using"));
            commandDictionary.Add(DriverCommand.FindChildElements, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element/:id/elements/:using"));
            commandDictionary.Add(DriverCommand.ClickElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element/:id/click"));
            commandDictionary.Add(DriverCommand.ClearElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element/:id/clear"));
            commandDictionary.Add(DriverCommand.SubmitElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element/:id/submit"));
            commandDictionary.Add(DriverCommand.GetElementText, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/element/:id/text"));
            commandDictionary.Add(DriverCommand.SendKeysToElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element/:id/value"));
            commandDictionary.Add(DriverCommand.GetElementValue, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/element/:id/value"));
            commandDictionary.Add(DriverCommand.GetElementTagName, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/element/:id/name"));
            commandDictionary.Add(DriverCommand.IsElementSelected, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/element/:id/selected"));
            commandDictionary.Add(DriverCommand.SetElementSelected, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element/:id/selected"));
            commandDictionary.Add(DriverCommand.ToggleElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element/:id/toggle"));
            commandDictionary.Add(DriverCommand.IsElementEnabled, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/element/:id/enabled"));
            commandDictionary.Add(DriverCommand.IsElementDisplayed, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/element/:id/displayed"));
            commandDictionary.Add(DriverCommand.HoverOverElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element/:id/hover"));
            commandDictionary.Add(DriverCommand.GetElementLocation, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/element/:id/location"));
            commandDictionary.Add(DriverCommand.GetElementSize, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/element/:id/size"));
            commandDictionary.Add(DriverCommand.GetElementAttribute, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/element/:id/attribute/:name"));
            commandDictionary.Add(DriverCommand.ElementEquals, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/element/:id/equals/:other"));
            commandDictionary.Add(DriverCommand.GetAllCookies, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/cookie"));
            commandDictionary.Add(DriverCommand.AddCookie, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/cookie"));
            commandDictionary.Add(DriverCommand.DeleteAllCookies, new CommandInfo(CommandInfo.DeleteCommand, "/session/:sessionId/:context/cookie"));
            commandDictionary.Add(DriverCommand.DeleteCookie, new CommandInfo(CommandInfo.DeleteCommand, "/session/:sessionId/:context/cookie/:name"));
            commandDictionary.Add(DriverCommand.SwitchToFrame, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/frame/:id"));
            commandDictionary.Add(DriverCommand.SwitchToWindow, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/window/:name"));
            commandDictionary.Add(DriverCommand.Close, new CommandInfo(CommandInfo.DeleteCommand, "/session/:sessionId/:context/window"));
            commandDictionary.Add(DriverCommand.DragElement, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/element/:id/drag"));
            commandDictionary.Add(DriverCommand.GetSpeed, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/speed"));
            commandDictionary.Add(DriverCommand.SetSpeed, new CommandInfo(CommandInfo.PostCommand, "/session/:sessionId/:context/speed"));
            commandDictionary.Add(DriverCommand.GetElementValueOfCssProperty, new CommandInfo(CommandInfo.GetCommand, "/session/:sessionId/:context/element/:id/css/:propertyName"));
        }

        private class CommandInfo
        {
            public const string PostCommand = "POST";
            public const string GetCommand = "GET";
            public const string DeleteCommand = "DELETE";

            private string targetUrl;
            private string method;

            public CommandInfo(string method, string targetUrl)
            {
                this.targetUrl = targetUrl;
                this.method = method;
            }

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
                else if (propertyName == "context")
                {
                    if (commandToExecute.Context != null)
                    {
                        propertyValue = commandToExecute.Context.ToString();
                    }
                }
                else if (commandToExecute.Parameters != null && commandToExecute.Parameters.Length > 0)
                {
                    Dictionary<string, object> parameterDictionary = commandToExecute.Parameters[0] as Dictionary<string, object>;
                    if (parameterDictionary != null && parameterDictionary.ContainsKey(propertyName))
                    {
                        if (parameterDictionary[propertyName] != null)
                        {
                            propertyValue = parameterDictionary[propertyName].ToString();
                        }
                    }
                }
                return propertyValue;
            }
        }
    }
}
