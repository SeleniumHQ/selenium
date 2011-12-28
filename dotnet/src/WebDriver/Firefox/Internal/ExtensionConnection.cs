// <copyright file="ExtensionConnection.cs" company="WebDriver Committers">
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
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox.Internal
{
    /// <summary>
    /// Represents the connection to the WebDriver Firefox extension.
    /// </summary>
    internal class ExtensionConnection : IExtensionConnection
    {
        #region Private members
        private List<IPEndPoint> addresses = new List<IPEndPoint>();
        private FirefoxProfile profile;
        private FirefoxBinary process;
        private HttpCommandExecutor executor;
        private string host;
        private TimeSpan timeout;
        #endregion

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="ExtensionConnection"/> class.
        /// </summary>
        /// <param name="binary">The <see cref="FirefoxBinary"/> on which to make the connection.</param>
        /// <param name="profile">The <see cref="FirefoxProfile"/> creating the connection.</param>
        /// <param name="host">The name of the host on which to connect to the Firefox extension (usually "localhost").</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public ExtensionConnection(FirefoxBinary binary, FirefoxProfile profile, string host, TimeSpan commandTimeout)
        {
            this.host = host;
            this.timeout = commandTimeout;
            this.profile = profile;
            if (binary == null)
            {
                this.process = new FirefoxBinary();
            }
            else
            {
                this.process = binary;
            }
        } 
        #endregion

        /// <summary>
        /// Gets the <see cref="FirefoxProfile"/> associated with this connection.
        /// </summary>
        public FirefoxProfile Profile
        {
            get { return this.profile; }
        }

        #region IExtensionConnection Members
        /// <summary>
        /// Starts the connection to the extension.
        /// </summary>
        public void Start()
        {
            using (ILock lockObject = new SocketLock(this.profile.Port - 1))
            {
                lockObject.LockObject(this.process.TimeoutInMilliseconds);
                try
                {
                    int portToUse = DetermineNextFreePort(this.host, this.profile.Port);
                    this.profile.Port = portToUse;
                    this.profile.WriteToDisk();
                    this.process.Clean(this.profile);
                    this.process.StartProfile(this.profile, new string[] { "-foreground" });

                    this.SetAddress(portToUse);

                    // TODO (JimEvans): Get a better url algorithm.
                    this.executor = new HttpCommandExecutor(new Uri(string.Format(CultureInfo.InvariantCulture, "http://{0}:{1}/hub/", this.host, portToUse)), this.timeout);
                }
                finally
                {
                    lockObject.UnlockObject();
                }
            }

            this.ConnectToBrowser(this.process.TimeoutInMilliseconds);
        }

        /// <summary>
        /// Closes the connection to the extension.
        /// </summary>
        public void Quit()
        {
            // This should only be called after the QUIT command has been sent,
            // so go ahead and clean up our process and profile.
            this.process.Quit();
            this.profile.Clean();
        }
        #endregion

        #region ICommandExecutor Members
        /// <summary>
        /// Executes a command
        /// </summary>
        /// <param name="commandToExecute">The command you wish to execute</param>
        /// <returns>A response from the browser</returns>
        public Response Execute(Command commandToExecute)
        {
            return this.executor.Execute(commandToExecute);
        }
        #endregion

        #region Support methods
        private static int DetermineNextFreePort(string host, int port)
        {
            // Attempt to connect to the given port on the host
            // If we can't connect, then we're good to use it
            int newPort;

            for (newPort = port; newPort < port + 200; newPort++)
            {
                using (Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp))
                {
                    socket.ExclusiveAddressUse = true;
                    IPHostEntry hostEntry = Dns.GetHostEntry(host);

                    // Use the first IPv4 address that we find
                    IPAddress endPointAddress = IPAddress.Parse("127.0.0.1");
                    foreach (IPAddress ip in hostEntry.AddressList)
                    {
                        if (ip.AddressFamily == AddressFamily.InterNetwork)
                        {
                            endPointAddress = ip;
                            break;
                        }
                    }

                    IPEndPoint address = new IPEndPoint(endPointAddress, newPort);

                    try
                    {
                        socket.Bind(address);
                        return newPort;
                    }
                    catch (SocketException)
                    {
                        // Port is already bound. Skip it and continue
                    }
                }
            }

            throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Cannot find free port in the range {0} to {1} ", port, newPort));
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

        private static bool IsSocketConnected(Socket extensionSocket)
        {
            return extensionSocket != null && extensionSocket.Connected;
        }

        private void SetAddress(int port)
        {
            if (string.Compare("localhost", this.host, StringComparison.OrdinalIgnoreCase) == 0)
            {
                this.addresses = ObtainLoopbackAddresses(port);
            }
            else
            {
                IPHostEntry hostEntry = Dns.GetHostEntry(this.host);

                // Use the first IPv4 address that we find
                IPAddress endPointAddress = IPAddress.Parse("127.0.0.1");
                foreach (IPAddress ip in hostEntry.AddressList)
                {
                    if (ip.AddressFamily == AddressFamily.InterNetwork)
                    {
                        endPointAddress = ip;
                        break;
                    }
                }

                IPEndPoint hostEndPoint = new IPEndPoint(endPointAddress, port);
                this.addresses.Add(hostEndPoint);
            }
        }

        private void ConnectToBrowser(long timeToWaitInMilliSeconds)
        {
            // Attempt to connect to the browser extension on a Socket.
            // A successful connection means the browser is running and
            // the extension has been properly initialized.
            Socket extensionSocket = null;
            DateTime waitUntil = DateTime.Now.AddMilliseconds(timeToWaitInMilliSeconds);
            try
            {
                while (!IsSocketConnected(extensionSocket) && waitUntil > DateTime.Now)
                {
                    foreach (IPEndPoint addr in this.addresses)
                    {
                        try
                        {
                            extensionSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                            extensionSocket.Connect(addr);
                            break;
                        }
                        catch (SocketException)
                        {
                            System.Threading.Thread.Sleep(250);
                        }
                    }
                }

                // If the socket was either not created or not connected successfully,
                // throw an exception.
                if (!IsSocketConnected(extensionSocket))
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
            finally
            {
                extensionSocket.Close();
            }
        }
        #endregion
    }
}
