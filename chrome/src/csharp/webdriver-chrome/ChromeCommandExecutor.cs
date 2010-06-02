using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Provides a mechanism to execute commands on the browser
    /// </summary>
    public class ChromeCommandExecutor : ICommandExecutor, IDisposable
    {
        private const int MaxStartRetries = 5;
        private const int ExtensionTimeoutInSeconds = 4;
        private const string HostPageHtml = "<html><head><script type='text/javascript'>if (window.location.search == '') { setTimeout(\"window.location = window.location.href + '?reloaded'\", 5000); }</script></head><body><p>ChromeDriver server started and connected.  Please leave this tab open.</p></body></html>";

        private bool executorHasClient;
        private Dictionary<DriverCommand, string> commandNameMap;
        private ChromeBinary executorBinary;

        private HttpListener mainListener;

        // private Queue<ExtensionRequestPacket> pendingRequestQueue = new Queue<ExtensionRequestPacket>();
        private List<ExtensionRequestPacket> pendingRequestQueue = new List<ExtensionRequestPacket>();
        private ManualResetEvent postRequestReceived = new ManualResetEvent(false);

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the ChromeCommandExecutor class
        /// </summary>
        /// <param name="binary">The <see cref="ChromeBinary"/> in which the commands are executed.</param>
        internal ChromeCommandExecutor(ChromeBinary binary)
        {
            executorBinary = binary;
            InitializeCommandNameMap();
        }
        #endregion

        #region Enums
        private enum ChromeExtensionPacketType
        {
            /// <summary>
            /// Represents the Unknown packet type
            /// </summary>
            Unknown,

            /// <summary>
            /// Represents the Get packet type
            /// </summary>
            Get,

            /// <summary>
            /// Represents the Post packet type
            /// </summary>
            Post
        }
        #endregion

        #region Properties
        /// <summary>
        /// Gets a value indicating whether it has the client
        /// </summary>
        public bool HasClient
        {
            get { return executorHasClient; }
        }
       
        #endregion

        #region Public Methods
        /// <summary>
        /// Starts the connection to the browser extension.
        /// </summary>
        public void Start()
        {
            int retries = MaxStartRetries;
            while (retries > 0 && !HasClient)
            {
                Stop();
                try
                {
                    StartListening();
                    executorBinary.Start();
                }
                catch (IOException e)
                {
                    throw new WebDriverException("Could not start client", e);
                }

                if (!HasClient)
                {
                    // In case this attempt fails, we increment how long we wait before sending a command
                    ChromeBinary.IncrementStartWaitInterval(1);
                }

                retries--;
            }

            // The last one attempt succeeded, so we reduce back to that time
            // chromeBinary.IncrementBackoffBy(-1);
            if (!HasClient)
            {
                Stop();
                throw new FatalChromeException("Cannot create chrome driver");
            }
        }

        /// <summary>
        /// Closes the connection to the extension.
        /// </summary>
        public void Stop()
        {
            StopListening();
            executorBinary.Kill();
        }

        /// <summary>
        /// Executes the Command in the browser
        /// </summary>
        /// <param name="commandToExecute">Command to execute</param>
        /// <returns>The response from the Browser</returns>
        public Response Execute(Command commandToExecute)
        {
            Response commandResponse = new Response(new SessionId("[No Session ID]"));
            if (commandToExecute.Name == DriverCommand.NewSession)
            {
                DesiredCapabilities capabilities = DesiredCapabilities.Chrome();
                Dictionary<string, object> capabilitiesMap = new Dictionary<string, object>();
                capabilitiesMap.Add("browserName", capabilities.BrowserName);
                capabilitiesMap.Add("version", capabilities.Version);
                capabilitiesMap.Add("platform", capabilities.Platform.Type.ToString());
                capabilitiesMap.Add("javascriptEnabled", true);
                commandResponse.Value = capabilitiesMap;
            }
            else
            {
                SendMessage(commandToExecute);
                commandResponse = HandleResponse();
            }

            return commandResponse;
        }
        #endregion

        #region IDisposable Members
        /// <summary>
        /// Releases all resources associated with this <see cref="ChromeCommandExecutor"/>.
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases all resources associated with this <see cref="ChromeCommandExecutor"/>.
        /// </summary>
        /// <param name="disposing"><see langword="true"/> to release only managed resources;
        /// <see langword="false"/> to release managed and unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (mainListener != null && mainListener.IsListening)
                {
                    mainListener.Close();
                }

                if (postRequestReceived != null)
                {
                    postRequestReceived.Close();
                }
            }
        }
        #endregion

        #region Private Methods
        private static string ParseResponse(string rawResponse)
        {
            string parsedResponse = string.Empty;
            parsedResponse = rawResponse.Substring(0, rawResponse.IndexOf("\nEOResponse\n", StringComparison.Ordinal));
            return parsedResponse;
        }

        /// <summary>
        /// Starts listening for the Chrome Server
        /// </summary>
        private void StartListening()
        {
            mainListener = new HttpListener();
            mainListener.Prefixes.Add(string.Format(CultureInfo.InvariantCulture, "http://localhost:{0}/", executorBinary.Port));
            mainListener.Start();
            mainListener.BeginGetContext(new AsyncCallback(OnClientConnect), mainListener);
        }

        /// <summary>
        /// Stops listening to the Chrome Server
        /// </summary>
        private void StopListening()
        {
            executorHasClient = false;
            pendingRequestQueue.Clear();
            if (mainListener != null)
            {
                if (mainListener.IsListening)
                {
                    mainListener.Stop();
                    mainListener.Abort();
                }
            }
        }

        private void SendMessage(Command commandToExecute)
        {
            // Wait for a POST request to be pending from the Chrome extension.
            // When one is received, get the packet from the queue.
            bool signalReceived = postRequestReceived.WaitOne(TimeSpan.FromSeconds(ExtensionTimeoutInSeconds));

            if (pendingRequestQueue.Count == 0)
            {
                throw new FatalChromeException("No pending requests from the extension in the queue");
            }

            // ExtensionRequestPacket packet = pendingRequestQueue.Dequeue();
            ExtensionRequestPacket packet = pendingRequestQueue[0];
            pendingRequestQueue.RemoveAt(0);

            // Get the parameter names to correctly serialize the command to JSON.
            commandToExecute.Parameters.Add("request", commandNameMap[commandToExecute.Name]);
            string commandStringToSend = commandToExecute.ParametersAsJsonString;

            // Send the response to the Chrome extension.
            Send(packet, commandStringToSend, "application/json; charset=UTF-8");
        }

        private Response HandleResponse()
        {
            // Wait for a POST request to be pending from the Chrome extension.
            // Note that we need to leave the packet in the queue for the next
            // send message.
            postRequestReceived.WaitOne(TimeSpan.FromSeconds(ExtensionTimeoutInSeconds));

            if (pendingRequestQueue.Count == 0)
            {
                throw new FatalChromeException("Expected a response from the extension, but none was found");
            }

            // ExtensionRequestPacket packet = pendingRequestQueue.Peek();
            ExtensionRequestPacket packet = pendingRequestQueue[0];

            // Parse the packet content, and deserialize from a JSON object.
            string responseString = ParseResponse(packet.Content);
            Response response = new Response();
            if (!string.IsNullOrEmpty(responseString))
            {
                response = Response.FromJson(responseString);
                if (response.Status == WebDriverResult.Success)
                {
                    string valueAsString = response.Value as string;
                    if (valueAsString != null)
                    {
                        // First, collapse all \r\n pairs to \n, then replace all \n with
                        // System.Environment.NewLine. This ensures the consistency of 
                        // the values.
                        response.Value = valueAsString.Replace("\r\n", "\n").Replace("\n", System.Environment.NewLine);
                    }
                }
            }

            return response;
        }

        private void OnClientConnect(IAsyncResult asyncResult)
        {
            try
            {
                HttpListener listener = (HttpListener)asyncResult.AsyncState;
                executorHasClient = true;

                // Here we complete/end the BeginGetContext() asynchronous call
                // by calling EndGetContext() - which returns the reference to
                // a new HttpListenerContext object. Then we can set up a new
                // thread to listen for the next connection.
                HttpListenerContext workerContext = listener.EndGetContext(asyncResult);
                IAsyncResult newResult = listener.BeginGetContext(new AsyncCallback(OnClientConnect), listener);
                
                ExtensionRequestPacket packet = new ExtensionRequestPacket(workerContext);

                // Console.WriteLine("ID {0} connected.", packet.ID);
                if (packet.PacketType == ChromeExtensionPacketType.Get)
                {
                    // Console.WriteLine("Received GET request from from {0}", packet.ID);
                    Send(packet, HostPageHtml, "text/html");
                }
                else
                {
                    // Console.WriteLine("Received from {0}:\n{1}", packet.ID, packet.Content);
                    // pendingRequestQueue.Enqueue(packet);
                    pendingRequestQueue.Add(packet);
                    postRequestReceived.Set();
                }

                // Console.WriteLine("ID {0} disconnected.", packet.ID);
            }
            catch (ObjectDisposedException)
            {
                System.Diagnostics.Debugger.Log(0, "1", "\n OnClientConnection: Socket has been closed\n");
            }
            catch (SocketException se)
            {
                Console.WriteLine("ERROR:" + se.Message);
            }
            catch (HttpListenerException hle)
            {
                // When we shut the HttpListener down, there will always still be
                // a thread pending listening for a request. If there is no client
                // connected, we may have a real problem here.
                if (!executorHasClient)
                {
                    Console.WriteLine(hle.Message);
                }
            }
        }

        private void Send(ExtensionRequestPacket packet, string data, string sendAsContentType)
        {
            if (packet.PacketType == ChromeExtensionPacketType.Post)
            {
                // Console.WriteLine("Sending to {0}:\n{1}", packet.ID, data);
                // Reset the signal so that the processor will wait for another
                // POST message.
                postRequestReceived.Reset();
            }

            byte[] byteData = Encoding.UTF8.GetBytes(data);
            HttpListenerResponse response = packet.Context.Response;
            response.KeepAlive = true;
            response.StatusCode = (int)HttpStatusCode.OK;
            response.StatusDescription = HttpStatusCode.OK.ToString();
            response.ContentType = sendAsContentType;
            response.ContentLength64 = byteData.LongLength;
            response.Close(byteData, true);
        }

        private void InitializeCommandNameMap()
        {
            commandNameMap = new Dictionary<DriverCommand, string>();
            commandNameMap.Add(DriverCommand.NewSession, "newSession");

            commandNameMap.Add(DriverCommand.Close, "close");
            commandNameMap.Add(DriverCommand.Quit, "quit");

            commandNameMap.Add(DriverCommand.Get, "get");
            commandNameMap.Add(DriverCommand.GoBack, "goBack");
            commandNameMap.Add(DriverCommand.GoForward, "goForward");
            commandNameMap.Add(DriverCommand.Refresh, "refresh");

            commandNameMap.Add(DriverCommand.AddCookie, "addCookie");
            commandNameMap.Add(DriverCommand.GetAllCookies, "getCookies");
            commandNameMap.Add(DriverCommand.DeleteCookie, "deleteCookie");
            commandNameMap.Add(DriverCommand.DeleteAllCookies, "deleteAllCookies");

            commandNameMap.Add(DriverCommand.FindElement, "findElement");
            commandNameMap.Add(DriverCommand.FindElements, "findElements");
            commandNameMap.Add(DriverCommand.FindChildElement, "findChildElement");
            commandNameMap.Add(DriverCommand.FindChildElements, "findChildElements");

            commandNameMap.Add(DriverCommand.ClearElement, "clearElement");
            commandNameMap.Add(DriverCommand.ClickElement, "clickElement");
            commandNameMap.Add(DriverCommand.HoverOverElement, "hoverOverElement");
            commandNameMap.Add(DriverCommand.SendKeysToElement, "sendKeysToElement");
            commandNameMap.Add(DriverCommand.SubmitElement, "submitElement");
            commandNameMap.Add(DriverCommand.ToggleElement, "toggleElement");

            commandNameMap.Add(DriverCommand.GetCurrentWindowHandle, "getCurrentWindowHandle");
            commandNameMap.Add(DriverCommand.GetWindowHandles, "getWindowHandles");

            commandNameMap.Add(DriverCommand.SwitchToWindow, "switchToWindow");
            commandNameMap.Add(DriverCommand.SwitchToFrame, "switchToFrame");
            commandNameMap.Add(DriverCommand.GetActiveElement, "getActiveElement");

            commandNameMap.Add(DriverCommand.GetCurrentUrl, "getCurrentUrl");
            commandNameMap.Add(DriverCommand.GetPageSource, "getPageSource");
            commandNameMap.Add(DriverCommand.GetTitle, "getTitle");

            commandNameMap.Add(DriverCommand.ExecuteScript, "executeScript");

            commandNameMap.Add(DriverCommand.GetSpeed, "getSpeed");
            commandNameMap.Add(DriverCommand.SetSpeed, "setSpeed");

            commandNameMap.Add(DriverCommand.SetBrowserVisible, "setBrowserVisible");
            commandNameMap.Add(DriverCommand.IsBrowserVisible, "isBrowserVisible");

            commandNameMap.Add(DriverCommand.GetElementText, "getElementText");
            commandNameMap.Add(DriverCommand.GetElementValue, "getElementValue");
            commandNameMap.Add(DriverCommand.GetElementTagName, "getElementTagName");
            commandNameMap.Add(DriverCommand.SetElementSelected, "setElementSelected");
            commandNameMap.Add(DriverCommand.DragElement, "dragElement");
            commandNameMap.Add(DriverCommand.IsElementSelected, "isElementSelected");
            commandNameMap.Add(DriverCommand.IsElementEnabled, "isElementEnabled");
            commandNameMap.Add(DriverCommand.IsElementDisplayed, "isElementDisplayed");
            commandNameMap.Add(DriverCommand.GetElementLocation, "getElementLocation");
            commandNameMap.Add(DriverCommand.GetElementLocationOnceScrolledIntoView, "getElementLocationOnceScrolledIntoView");
            commandNameMap.Add(DriverCommand.GetElementSize, "getElementSize");
            commandNameMap.Add(DriverCommand.GetElementAttribute, "getElementAttribute");
            commandNameMap.Add(DriverCommand.GetElementValueOfCssProperty, "getElementValueOfCssProperty");
            commandNameMap.Add(DriverCommand.ElementEquals, "elementEquals");

            commandNameMap.Add(DriverCommand.Screenshot, "screenshot");
            commandNameMap.Add(DriverCommand.ImplicitlyWait, "implicitlyWait");
        }
        #endregion

        /// <summary>
        /// Provides a mechanism to handle requests from the Chrome Extension
        /// </summary>
        private class ExtensionRequestPacket
        {
            private HttpListenerContext packetContext;
            private ChromeExtensionPacketType extensionPacketType = ChromeExtensionPacketType.Unknown;
            private Guid packetId = Guid.NewGuid();
            private string content = string.Empty;

            /// <summary>
            /// Initializes a new instance of the ExtensionRequestPacket class
            /// </summary>
            /// <param name="currentContext">Current HTTP Context in use</param>
            public ExtensionRequestPacket(HttpListenerContext currentContext)
            {
                packetContext = currentContext;

                if (string.Compare(packetContext.Request.HttpMethod, "get", StringComparison.OrdinalIgnoreCase) == 0)
                {
                    extensionPacketType = ChromeExtensionPacketType.Get;
                }
                else
                {
                    extensionPacketType = ChromeExtensionPacketType.Post;
                }

                DateTime readTimeout = DateTime.Now.AddSeconds(10);
                HttpListenerRequest request = packetContext.Request;
                int length = (int)request.ContentLength64;
                byte[] packetDataBuffer = new byte[length];
                int totalBytesRead = request.InputStream.Read(packetDataBuffer, 0, length);
                while (totalBytesRead < length && DateTime.Now <= readTimeout)
                {
                    totalBytesRead += request.InputStream.Read(packetDataBuffer, totalBytesRead, length - totalBytesRead);
                }

                content = Encoding.UTF8.GetString(packetDataBuffer);
            }

            /// <summary>
            /// Gets the Unique packet ID
            /// </summary>
            public Guid ID
            {
                get { return packetId; }
            }

            /// <summary>
            /// Gets the Packet Type
            /// </summary>
            public ChromeExtensionPacketType PacketType
            {
                get { return extensionPacketType; }
            }

            /// <summary>
            /// Gets the Context
            /// </summary>
            public HttpListenerContext Context
            {
                get { return packetContext; }
            }

            /// <summary>
            /// Gets the Content 
            /// </summary>
            public string Content
            {
                get { return content; }
            }
        }
    }
}
