using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Firefox.Internal
{
    /// <summary>
    /// Represents the connection to the WebDriver Firefox extension.
    /// </summary>
    internal class ExtensionConnection : IExtensionConnection
    {
        #region Private members
        private Socket extensionSocket;
        private List<IPEndPoint> addresses = new List<IPEndPoint>();
        private FirefoxProfile profile;
        private FirefoxBinary process; 
        #endregion

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="ExtensionConnection"/> class.
        /// </summary>
        /// <param name="lockObject">An <see cref="ILock"/> object used to lock the mutex port before connection.</param>
        /// <param name="binary">The <see cref="FirefoxBinary"/> on which to make the connection.</param>
        /// <param name="profile">The <see cref="FirefoxProfile"/> creating the connection.</param>
        /// <param name="host">The name of the host on which to connect to the Firefox extension (usually "localhost").</param>
        public ExtensionConnection(ILock lockObject, FirefoxBinary binary, FirefoxProfile profile, string host)
        {
            this.profile = profile;
            if (binary == null)
            {
                this.process = new FirefoxBinary();
            }
            else
            {
                this.process = binary;
            }

            lockObject.LockObject(this.process.TimeoutInMilliseconds);
            try
            {
                int portToUse = DetermineNextFreePort(host, profile.Port);

                profile.Port = portToUse;
                profile.UpdateUserPreferences();
                this.process.Clean(profile);
                this.process.StartProfile(profile, null);

                SetAddress(host, portToUse);

                ConnectToBrowser(this.process.TimeoutInMilliseconds);
            }
            finally
            {
                lockObject.UnlockObject();
            }
        } 
        #endregion

        #region IExtensionConnection Members
        /// <summary>
        /// Gets a value indicating whether the driver is connected to the extension.
        /// </summary>
        public bool IsConnected
        {
            get { return extensionSocket != null && extensionSocket.Connected; }
        }

        /// <summary>
        /// Sends a message to the extension and waits for a response.
        /// </summary>
        /// <param name="throwOnFailure">The <see cref="System.Type"/> of object to instantiate
        /// if the command fails.</param>
        /// <param name="command">The <see cref="Command"/> to execute.</param>
        /// <returns>A <see cref="Response"/> that contains the data returned by the command.</returns>
        public Response SendMessageAndWaitForResponse(Type throwOnFailure, Command command)
        {
            SendMessage(command);
            Response returnedResponse = WaitForResponseForCommand(command.Name);
            return returnedResponse;
        }

        /// <summary>
        /// Closes the connection to the extension.
        /// </summary>
        public void Quit()
        {
            try
            {
                SendMessage(new Command(null, "quit", null));
            }
            catch (WebDriverException)
            {
                // this is expected
            }

            process.Quit();

            profile.Clean();
        }
        #endregion

        #region IDisposable Members
        /// <summary>
        /// Releases all resources associated with this <see cref="ExtensionConnection"/>.
        /// </summary>
        public void Dispose()
        {
            if (extensionSocket != null && extensionSocket.Connected)
            {
                extensionSocket.Close();
            }

            GC.SuppressFinalize(this);
        }

        #endregion

        #region Support methods
        private static int DetermineNextFreePort(string host, int port)
        {
            // Attempt to connect to the given port on the host
            // If we can't connect, then we're good to use it
            int newport;

            for (newport = port; newport < port + 200; newport++)
            {
                Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

                IPHostEntry hostEntry = Dns.GetHostEntry(host);
                IPEndPoint address = new IPEndPoint(hostEntry.AddressList[0], newport);

                try
                {
                    socket.Bind(address);
                    return newport;
                }
                catch (SocketException)
                {
                    // Port is already bound. Skip it and continue
                }
                finally
                {
                    socket.Close();
                }
            }

            throw new WebDriverException(
                string.Format(CultureInfo.InvariantCulture, "Cannot find free port in the range {0} to {0} ", port, newport));
        }

        private static List<IPEndPoint> ObtainLoopbackAddresses(int port)
        {
            List<IPEndPoint> endpoints = new List<IPEndPoint>();

            // Obtain a reference to all network interfaces in the machine
            NetworkInterface[] adapters = NetworkInterface.GetAllNetworkInterfaces();
            foreach (NetworkInterface adapter in adapters)
            {
                IPInterfaceProperties properties = adapter.GetIPProperties();
                foreach (IPAddressInformation uniCast in properties.UnicastAddresses)
                {
                    if (IPAddress.IsLoopback(uniCast.Address))
                    {
                        endpoints.Add(new IPEndPoint(uniCast.Address, port));
                    }
                }
            }

            return endpoints;
        }

        private void SetAddress(string host, int port)
        {
            if (string.Compare("localhost", host, StringComparison.OrdinalIgnoreCase) == 0)
            {
                addresses = ObtainLoopbackAddresses(port);
            }
            else
            {
                IPHostEntry hostEntry = Dns.GetHostEntry(host);
                IPEndPoint hostEndPoint = new IPEndPoint(hostEntry.AddressList[0], port);
                addresses.Add(hostEndPoint);
            }
        }

        private void Connect(IPEndPoint addr)
        {
            extensionSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

            extensionSocket.Connect(addr);
        }

        private void ConnectToBrowser(long timeToWaitInMilliSeconds)
        {
            DateTime waitUntil = DateTime.Now.AddMilliseconds(timeToWaitInMilliSeconds);
            while (!IsConnected && waitUntil > DateTime.Now)
            {
                foreach (IPEndPoint addr in addresses)
                {
                    try
                    {
                        Connect(addr);
                        break;
                    }
                    catch (SocketException)
                    {
                        System.Threading.Thread.Sleep(250);
                    }
                }
            }

            if (!IsConnected)
            {
                if (extensionSocket == null || extensionSocket.RemoteEndPoint == null)
                {
                    throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Failed to start up socket within {0}", timeToWaitInMilliSeconds));
                }
                else
                {
                    IPEndPoint endPoint = (IPEndPoint)extensionSocket.RemoteEndPoint;
                    string formattedError = string.Format(CultureInfo.InvariantCulture, "Unable to connect to host {0} on port {1} after {2} ms", endPoint.Address.ToString(), endPoint.Port.ToString(CultureInfo.InvariantCulture), timeToWaitInMilliSeconds);
                    throw new WebDriverException(formattedError);
                }
            }
        }

        private void SendMessage(Command command)
        {
            string converted = JsonConvert.SerializeObject(command, new JsonConverter[] { new ContextJsonConverter(), new CharArrayJsonConverter(), new CookieJsonConverter() });

            // Make this look like an HTTP request
            StringBuilder message = new StringBuilder();
            message.Append("GET / HTTP/1.1\n");
            message.Append("Host: localhost\n");
            message.Append("Content-Length: ");
            message.Append(converted.Length).Append("\n\n");
            message.Append(converted).Append("\n");

            try
            {
                byte[] messageBuffer = Encoding.UTF8.GetBytes(message.ToString());
                using (NetworkStream socketStream = new NetworkStream(extensionSocket))
                {
                    socketStream.Write(messageBuffer, 0, messageBuffer.Length);
                    socketStream.Flush();
                }
            }
            catch (IOException e)
            {
                throw new WebDriverException("Error found sending message", e);
            }
        }

        private Response WaitForResponseForCommand(string commandName)
        {
            try
            {
                return ReadLoop(commandName);
            }
            catch (IOException e)
            {
                throw new WebDriverException(string.Empty, e);
            }
        }

        private Response ReadLoop(string commandName)
        {
            Response response = GetNextResponse();

            if (commandName == response.Command)
            {
                return response;
            }

            throw new WebDriverException(
                "Expected response to " + commandName + " but actually got: " + response.Command + " ("
                + response.Command + ")");
        }

        private Response GetNextResponse()
        {
            string line = ReadNextLine();

            // Expected input will be of the form:
            // Header: Value
            // \n
            // JSON object
            //
            // The only expected header is "Length"

            // Read headers
            int count = 0;
            string[] parts = line.Split(new string[] { ":" }, 2, StringSplitOptions.None);
            if (string.Compare(parts[0], "Length", StringComparison.OrdinalIgnoreCase) == 0)
            {
                count = int.Parse(parts[1].Trim(), CultureInfo.InvariantCulture);
            }

            // Wait for the blank line
            while (line.Length != 0)
            {
                line = ReadNextLine();
            }

            // Read the rest of the response.
            byte[] remaining = new byte[count];
            using (NetworkStream socketStream = new NetworkStream(extensionSocket, false))
            {
                for (int i = 0; i < count; i++)
                {
                    remaining[i] = (byte)socketStream.ReadByte();
                }
            }

            string remainingString = Encoding.UTF8.GetString(remaining);
            Response returnedResponse = JsonConvert.DeserializeObject<Response>(remainingString, new JsonConverter[] { new ContextJsonConverter() });
            return returnedResponse;
        }

        private string ReadNextLine()
        {
            int size = 4096;
            int growBy = 1024;
            byte[] raw = new byte[size];
            int count = 0;

            using (NetworkStream socketStream = new NetworkStream(extensionSocket))
            {
                bool lineMarkerFound = false;
                while (!lineMarkerFound)
                {
                    int b = socketStream.ReadByte();

                    if (b == -1 || (char)b == '\n')
                    {
                        lineMarkerFound = true;
                    }

                    if (!lineMarkerFound)
                    {
                        raw[count++] = (byte)b;
                        if (count == size)
                        {
                            size += growBy;
                            byte[] temp = new byte[size];
                            Array.Copy(raw, temp, count);
                            raw = temp;
                        }
                    }
                }
            }

            string returnedLine = Encoding.UTF8.GetString(raw, 0, count);
            return returnedLine;
        } 
        #endregion
    }
}
