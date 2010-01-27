using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Remote;
using System.Net.Sockets;
using System.Net;
using System.Threading;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Chrome
{
    public class ChromeCommandExecutor
    {
        private const string HostPageHtml = "<html><head><script type='text/javascript'>if (window.location.search == '') { setTimeout(\"window.location = window.location.href + '?reloaded'\", 5000); }</script></head><body><p>ChromeDriver server started and connected.  Please leave this tab open.</p></body></html>";
        private const string HttpMessageString = "HTTP/1.1 200 OK\r\nContent-Length: {0}\r\nContent-Type: {1}\r\n\r\n{2}";

        private readonly string[] NoCommandArguments = new string[] { };
        private readonly string[] ElementIdCommandArgument = new string[] { "elementId" };

        private int executorPort = -1;
        private bool executorHasClient;
        private Dictionary<DriverCommand, string[]> executorCommands;

        private Socket mainSocket;
        private List<SocketPacket> socketList = new List<SocketPacket>();
        private ManualResetEvent postRequestComplete = new ManualResetEvent(false);

        // Would love to use a Queue here, but for some reason, it doesn't work
        // across the threads.
        // private Queue<SocketPacket> socketQueue = new Queue<SocketPacket>();

        public ChromeCommandExecutor()
            : this(1234)
        {
        }

        public ChromeCommandExecutor(int port)
        {
            executorPort = port;
            executorCommands = InitializeCommandDictionary();
        }

        public int Port
        {
            get { return executorPort; }
        }

        public bool HasClient
        {
            get { return executorHasClient; }
        }

        public void StartListening()
        {
            // Create the listening socket...
            mainSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            IPEndPoint ipLocal = new IPEndPoint(IPAddress.Any, executorPort);
            // Bind to local IP Address...
            mainSocket.Bind(ipLocal);
            // Start listening...
            mainSocket.Listen(4);
            // Create the call back for any client connections...
            mainSocket.BeginAccept(new AsyncCallback(OnClientConnect), null);
        }

        public void StopListening()
        {
            if (mainSocket != null)
            {
                mainSocket.Close();
            }
            foreach (SocketPacket workerSocket in socketList)
            {
                workerSocket.CurrentSocket.Close();
            }
            socketList.Clear();

            executorHasClient = false;
        }

        public ChromeResponse Execute(ChromeCommand commandToExecute)
        {
            SendMessage(commandToExecute);
            return HandleResponse();
        }

        private void SendMessage(ChromeCommand commandToExecute)
        {
            // Wait for a POST request to be pending from the Chrome extension.
            TimeSpan ts = TimeSpan.FromSeconds(5);
            bool signalReceived = postRequestComplete.WaitOne(ts);

            // Get the packet from the list (and remove it).
            SocketPacket packet = socketList[0];
            socketList.RemoveAt(0);

            // See the Queue comment at the top of this class.
            // SocketPacket packet = socketQueue.Dequeue();
            // Get the parameter names to correctly serialize the command to JSON.
            commandToExecute.ParameterNames = executorCommands[commandToExecute.Name];
            string commandStringToSend = JsonConvert.SerializeObject(commandToExecute, new JsonConverter[] { new ChromeCommandJsonConverter(), new CookieJsonConverter() });

            //Send the response to the Chrome extension.
            Send(packet, commandStringToSend, "application/json; charset=UTF-8");
        }

        private ChromeResponse HandleResponse()
        {
            // Wait for a POST request to be pending from the Chrome extension.
            postRequestComplete.WaitOne(TimeSpan.FromSeconds(5));
            SocketPacket packet = socketList[0];

            // Parse the packet content, and deserialize from a JSON object.
            string responseString = ParseResponse(packet.ContentAsString);
            ChromeResponse response = JsonConvert.DeserializeObject<ChromeResponse>(responseString);
            if (response.StatusCode != 0)
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
                        //Cookie error
                        throw new WebDriverException(message);
                    case 3:
                        throw new NoSuchWindowException(message);
                    case 7:
                        throw new NoSuchElementException(message);
                    case 8:
                        throw new NoSuchFrameException(message);
                    case 9:
                        //Unknown command
                        throw new NotImplementedException(message);
                    case 10:
                        throw new StaleElementReferenceException(message);
                    case 11:
                        throw new ElementNotVisibleException(message);
                    case 12:
                        //Invalid element state (e.g. disabled)
                        throw new NotSupportedException(message);
                    case 13:
                        //Unhandled error
                        throw new WebDriverException(message);
                    case 17:
                        //Bad javascript
                        throw new WebDriverException(message);
                    case 19:
                        //Bad xpath
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

            return response;
        }

        private string ParseResponse(string rawResponse)
        {
            string parsedResponse = string.Empty;
            string[] responseParts = rawResponse.Split(new string[] { "\r\n\r\n" }, StringSplitOptions.None);
            if (responseParts.Length == 2)
            {
                string responseHeaders = responseParts[0];
                string responseContent = responseParts[1];
                responseContent = responseContent.Substring(0, responseContent.IndexOf("\nEOResponse\n"));
                parsedResponse = responseContent;
            }

            return parsedResponse;
        }

        private void OnClientConnect(IAsyncResult asyncResult)
        {
            try
            {
                executorHasClient = true;
                // Here we complete/end the BeginAccept() asynchronous call
                // by calling EndAccept() - which returns the reference to
                // a new Socket object
                Socket workerSocket = mainSocket.EndAccept(asyncResult);
                // Let the worker Socket do the further processing for the 
                // just connected client
                SocketPacket packet = new SocketPacket(workerSocket);
                //activeSockets.Add(packet.ID, packet);
                // Start receiving any data written by the connected client
                // asynchronously
                packet.CurrentSocket.BeginReceive(packet.DataBuffer, 0, packet.DataBuffer.Length, SocketFlags.None, new AsyncCallback(OnDataReceived), packet);
                // Display this client connection as a status message on the GUI

                Console.WriteLine("Client ID {0} connected", packet.ID);

                // Since the main Socket is now free, it can go back and wait for
                // other clients who are attempting to connect
                mainSocket.BeginAccept(new AsyncCallback(OnClientConnect), null);
            }
            catch (ObjectDisposedException)
            {
                System.Diagnostics.Debugger.Log(0, "1", "\n OnClientConnection: Socket has been closed\n");
            }
            catch (SocketException se)
            {
                Console.WriteLine("ERROR:" + se.Message);
            }
        }

        // This the call back function which will be invoked when the socket
        // detects any client writing of data on the stream
        public void OnDataReceived(IAsyncResult asyncResult)
        {
            try
            {
                SocketPacket socketData = (SocketPacket)asyncResult.AsyncState;

                int receivedByteCount = 0;
                // Complete the BeginReceive() asynchronous call by EndReceive() method
                // which will return the number of characters written to the stream 
                // by the client
                receivedByteCount = socketData.CurrentSocket.EndReceive(asyncResult);
                socketData.ProcessContent(receivedByteCount);
                int bytesRemaining = socketData.CurrentSocket.Available;
                if (bytesRemaining > 0 || (socketData.PacketType == ChromeExtensionPacketType.Post && !socketData.ContentAsString.Contains("EOResponse")))
                {
                    if (socketData.PacketType == ChromeExtensionPacketType.Post)
                    {
                        postRequestComplete.Reset();
                    }
                    // Continue the waiting for data on the Socket
                    socketData.CurrentSocket.BeginReceive(socketData.DataBuffer, 0, socketData.DataBuffer.Length, SocketFlags.None, new AsyncCallback(OnDataReceived), socketData);
                }
                else
                {
                    Console.WriteLine("Received from ID {0}:\n{1}", socketData.ID, socketData.ContentAsString);
                    if (socketData.PacketType == ChromeExtensionPacketType.Get)
                    {
                        Send(socketData, HostPageHtml, "text/html");
                    }
                    else
                    {
                        socketList.Add(socketData);
                        //socketQueue.Enqueue(socketData);
                        postRequestComplete.Set();
                    }
                }
            }
            catch (ObjectDisposedException)
            {
                System.Diagnostics.Debugger.Log(0, "1", "\nOnDataReceived: Socket has been closed\n");
            }
            catch (SocketException se)
            {
                Console.WriteLine("ERROR:" + se.Message);
            }
        }

        private void Send(SocketPacket packet, string data, string sendAsContentType)
        {
            Socket handler = packet.CurrentSocket;

            if (packet.PacketType == ChromeExtensionPacketType.Post)
            {
                postRequestComplete.Reset();
            }
            byte[] byteData = Encoding.UTF8.GetBytes(data);
            int dataLength = byteData.Length;
            string fullMessage = string.Format(HttpMessageString, dataLength, sendAsContentType, data);
            Console.WriteLine("Sending to ID {0}:\n{1}", packet.ID, fullMessage);
            byte[] fullMessageData = Encoding.UTF8.GetBytes(fullMessage);
            
            // Begin sending the data to the remote device.
            handler.BeginSend(fullMessageData, 0, fullMessageData.Length, 0, new AsyncCallback(OnDataSent), packet);
        }

        private void OnDataSent(IAsyncResult ar)
        {
            try
            {
                SocketPacket packet = (SocketPacket)ar.AsyncState;
                // Retrieve the socket from the state object.
                Socket handler = packet.CurrentSocket;

                // Complete sending the data to the remote device.
                int bytesSent = handler.EndSend(ar);

                handler.Shutdown(SocketShutdown.Both);
                handler.Close();
                Console.WriteLine("Client ID {0} disconnected.", packet.ID);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
            }
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

        private enum ChromeExtensionPacketType
        {
            Unknown,
            Get,
            Post
        }

        private class SocketPacket
        {
            private ChromeExtensionPacketType extensionPacketType = ChromeExtensionPacketType.Unknown;
            private Guid packetId = Guid.NewGuid();
            private Socket packetSocket;
            private byte[] packetDataBuffer = new byte[1024];
            private StringBuilder content = null;

            public Guid ID
            {
                get { return packetId; }
            }

            public SocketPacket(Socket currentSocket)
            {
                packetSocket = currentSocket;
            }

            public ChromeExtensionPacketType PacketType
            {
                get { return extensionPacketType; }
            }

            public Socket CurrentSocket
            {
                get { return packetSocket; }
            }

            public byte[] DataBuffer
            {
                get { return packetDataBuffer; }
            }

            public void ProcessContent(int contentLength)
            {
                string currentContent = Encoding.UTF8.GetString(packetDataBuffer, 0, contentLength);
                if (content == null)
                {
                    if (currentContent.StartsWith("G", StringComparison.OrdinalIgnoreCase))
                    {
                        extensionPacketType = ChromeExtensionPacketType.Get;
                    }
                    else
                    {
                        extensionPacketType = ChromeExtensionPacketType.Post;
                    }
                    content = new StringBuilder(currentContent);
                }
                else
                {
                    content.Append(currentContent);
                }
            }

            public string ContentAsString
            {
                get { return content.ToString(); }
            }
        }
    }
}
