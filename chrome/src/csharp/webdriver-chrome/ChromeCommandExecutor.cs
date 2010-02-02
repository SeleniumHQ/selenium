using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

using Newtonsoft.Json;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Provides a mechanism to execute commands on the browser
    /// </summary>
    public class ChromeCommandExecutor
    {
        private const string HostPageHtml = "<html><head><script type='text/javascript'>if (window.location.search == '') { setTimeout(\"window.location = window.location.href + '?reloaded'\", 5000); }</script></head><body><p>ChromeDriver server started and connected.  Please leave this tab open.</p></body></html>";

        private readonly string[] NoCommandArguments = new string[] { };
        private readonly string[] ElementIdCommandArgument = new string[] { "elementId" };

        private int executorPort = -1;
        private bool executorHasClient;
        private Dictionary<DriverCommand, string[]> executorCommands;

        private HttpListener mainListener;

        // private Queue<ExtensionRequestPacket> pendingRequestQueue = new Queue<ExtensionRequestPacket>();
        private List<ExtensionRequestPacket> pendingRequestQueue = new List<ExtensionRequestPacket>();
        private ManualResetEvent postRequestReceived = new ManualResetEvent(false);

        #region Constructors
        /// <summary>
        /// Initializes a new instance of the ChromeCommandExecutor class
        /// </summary>
        public ChromeCommandExecutor()
            : this(1234)
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeCommandExecutor class
        /// </summary>
        /// <param name="port">Port the Chrome Server is running on</param>
        public ChromeCommandExecutor(int port)
        {
            executorPort = port;
            executorCommands = InitializeCommandDictionary();
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
        /// Gets the port of the Chrome Server
        /// </summary>
        public int Port
        {
            get { return executorPort; }
        }

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
        /// Starts listening for the Chrome Server
        /// </summary>
        public void StartListening()
        {
            mainListener = new HttpListener();
            mainListener.Prefixes.Add(string.Format("http://localhost:{0}/", executorPort));
            mainListener.Start();
            mainListener.BeginGetContext(new AsyncCallback(OnClientConnect), mainListener);
        }

        /// <summary>
        /// Stops listening to the Chrome Server
        /// </summary>
        public void StopListening()
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

        /// <summary>
        /// Executes the Command in the browser
        /// </summary>
        /// <param name="commandToExecute">Command to execute</param>
        /// <returns>The response from the Browser</returns>
        public ChromeResponse Execute(ChromeCommand commandToExecute)
        {
            SendMessage(commandToExecute);
            return HandleResponse();
        }
        #endregion

        #region Private Methods
        private void SendMessage(ChromeCommand commandToExecute)
        {
            // Wait for a POST request to be pending from the Chrome extension.
            // When one is received, get the packet from the queue.
            bool signalReceived = postRequestReceived.WaitOne(TimeSpan.FromSeconds(5));

            // ExtensionRequestPacket packet = pendingRequestQueue.Dequeue();
            ExtensionRequestPacket packet = pendingRequestQueue[0];
            pendingRequestQueue.RemoveAt(0);

            // Get the parameter names to correctly serialize the command to JSON.
            commandToExecute.ParameterNames = executorCommands[commandToExecute.Name];
            string commandStringToSend = JsonConvert.SerializeObject(commandToExecute, new JsonConverter[] { new ChromeCommandJsonConverter(), new CookieJsonConverter() });

            // Send the response to the Chrome extension.
            Send(packet, commandStringToSend, "application/json; charset=UTF-8");
        }

        private ChromeResponse HandleResponse()
        {
            // Wait for a POST request to be pending from the Chrome extension.
            // Note that we need to leave the packet in the queue for the next
            // send message.
            postRequestReceived.WaitOne(TimeSpan.FromSeconds(5));

            // ExtensionRequestPacket packet = pendingRequestQueue.Peek();
            ExtensionRequestPacket packet = pendingRequestQueue[0];

            // Parse the packet content, and deserialize from a JSON object.
            string responseString = ParseResponse(packet.Content);
            ChromeResponse response = new ChromeResponse();
            if (!string.IsNullOrEmpty(responseString))
            {
                response = JsonConvert.DeserializeObject<ChromeResponse>(responseString);
                if (response.StatusCode == 0)
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
                else
                {
                    string message = string.Empty;
                    Dictionary<string, object> responseValue = response.Value as Dictionary<string, object>;
                    if (responseValue != null && responseValue.ContainsKey("message"))
                    {
                        message = responseValue["message"].ToString();
                    }

                    switch (response.StatusCode)
                    {
                        case 2:
                            // Cookie error
                            throw new WebDriverException(message);
                        case 3:
                            throw new NoSuchWindowException(message);
                        case 7:
                            throw new NoSuchElementException(message);
                        case 8:
                            throw new NoSuchFrameException(message);
                        case 9:
                            // Unknown command
                            throw new NotImplementedException(message);
                        case 10:
                            throw new StaleElementReferenceException(message);
                        case 11:
                            throw new ElementNotVisibleException(message);
                        case 12:
                            // Invalid element state (e.g. disabled)
                            throw new NotSupportedException(message);
                        case 13:
                            // Unhandled error
                            throw new WebDriverException(message);
                        case 17:
                            // Bad javascript
                            throw new InvalidOperationException(message);
                        case 19:
                            // Bad xpath
                            throw new XPathLookupException(message);
                        case 99:
                            throw new WebDriverException("An error occured when sending a native event");
                        case 500:
                            if (message == string.Empty)
                            {
                                message = "An error occured due to the internals of Chrome. " +
                                "This does not mean your test failed. " +
                                "Try running your test again in isolation.";
                            }

                            throw new FatalChromeException(message);
                    }
                }
            }

            return response;
        }

        private string ParseResponse(string rawResponse)
        {
            string parsedResponse = string.Empty;
            parsedResponse = rawResponse.Substring(0, rawResponse.IndexOf("\nEOResponse\n"));
            return parsedResponse;
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
            response.StatusCode = 200;
            response.StatusDescription = "OK";
            response.ContentType = sendAsContentType;
            response.ContentLength64 = byteData.LongLength;
            response.Close(byteData, true);
        }

        private Dictionary<DriverCommand, string[]> InitializeCommandDictionary()
        {
            Dictionary<DriverCommand, string[]> commands = new Dictionary<DriverCommand, string[]>();
            commands.Add(DriverCommand.Close, NoCommandArguments);
            commands.Add(DriverCommand.Quit, NoCommandArguments);
            commands.Add(DriverCommand.Get, new string[] { "url" });
            commands.Add(DriverCommand.GoBack, NoCommandArguments);
            commands.Add(DriverCommand.GoForward, NoCommandArguments);
            commands.Add(DriverCommand.Refresh, NoCommandArguments);
            commands.Add(DriverCommand.AddCookie, new string[] { "cookie" });
            commands.Add(DriverCommand.GetAllCookies, NoCommandArguments);
            commands.Add(DriverCommand.GetCookie, new string[] { "name" });
            commands.Add(DriverCommand.DeleteAllCookies, NoCommandArguments);
            commands.Add(DriverCommand.DeleteCookie, new string[] { "name" });
            commands.Add(DriverCommand.FindElement, new string[] { "using", "value" });
            commands.Add(DriverCommand.FindElements, new string[] { "using", "value" });
            commands.Add(DriverCommand.FindChildElement, new string[] { "id", "using", "value" });
            commands.Add(DriverCommand.FindChildElements, new string[] { "id", "using", "value" });
            commands.Add(DriverCommand.ClearElement, ElementIdCommandArgument);
            commands.Add(DriverCommand.ClickElement, ElementIdCommandArgument);
            commands.Add(DriverCommand.HoverOverElement, ElementIdCommandArgument);
            commands.Add(DriverCommand.SendKeysToElement, new string[] { "elementId", "keys" });
            commands.Add(DriverCommand.SubmitElement, ElementIdCommandArgument);
            commands.Add(DriverCommand.ToggleElement, ElementIdCommandArgument);
            commands.Add(DriverCommand.GetElementAttribute, new string[] { "elementId", "attribute" });
            commands.Add(DriverCommand.GetElementLocationOnceScrolledIntoView, ElementIdCommandArgument);
            commands.Add(DriverCommand.GetElementLocation, ElementIdCommandArgument);
            commands.Add(DriverCommand.GetElementSize, ElementIdCommandArgument);
            commands.Add(DriverCommand.GetElementTagName, ElementIdCommandArgument);
            commands.Add(DriverCommand.GetElementText, ElementIdCommandArgument);
            commands.Add(DriverCommand.GetElementValue, ElementIdCommandArgument);
            commands.Add(DriverCommand.GetElementValueOfCssProperty, new string[] { "elementId", "css" });
            commands.Add(DriverCommand.IsElementDisplayed, ElementIdCommandArgument);
            commands.Add(DriverCommand.IsElementEnabled, ElementIdCommandArgument);
            commands.Add(DriverCommand.IsElementSelected, ElementIdCommandArgument);
            commands.Add(DriverCommand.SetElementSelected, ElementIdCommandArgument);
            commands.Add(DriverCommand.GetActiveElement, NoCommandArguments);
            commands.Add(DriverCommand.SwitchToFrameByIndex, new string[] { "index" });
            commands.Add(DriverCommand.SwitchToFrameByName, new string[] { "name" });
            commands.Add(DriverCommand.SwitchToDefaultContent, NoCommandArguments);
            commands.Add(DriverCommand.GetCurrentWindowHandle, NoCommandArguments);
            commands.Add(DriverCommand.GetWindowHandles, NoCommandArguments);
            commands.Add(DriverCommand.SwitchToWindow, new string[] { "windowname" });
            commands.Add(DriverCommand.GetCurrentUrl, NoCommandArguments);
            commands.Add(DriverCommand.GetPageSource, NoCommandArguments);
            commands.Add(DriverCommand.GetTitle, NoCommandArguments);
            commands.Add(DriverCommand.ExecuteScript, new string[] { "script", "args" });
            commands.Add(DriverCommand.Screenshot, NoCommandArguments);
            return commands;
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
