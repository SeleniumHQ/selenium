// <copyright file="FirefoxDriverServer.cs" company="WebDriver Committers">
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
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text;
using OpenQA.Selenium.Firefox.Internal;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Provides methods for launching Firefox with the WebDriver extension installed.
    /// </summary>
    public class FirefoxDriverServer : ICommandServer
    {
        private string host;
        private List<IPEndPoint> addresses = new List<IPEndPoint>();
        private FirefoxProfile profile;
        private FirefoxBinary process;
        private Uri extensionUri;

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriverServer"/> class.
        /// </summary>
        /// <param name="binary">The <see cref="FirefoxBinary"/> on which to make the connection.</param>
        /// <param name="profile">The <see cref="FirefoxProfile"/> creating the connection.</param>
        /// <param name="host">The name of the host on which to connect to the Firefox extension (usually "localhost").</param>
        public FirefoxDriverServer(FirefoxBinary binary, FirefoxProfile profile, string host)
        {
            this.host = host;
            if (profile == null)
            {
                this.profile = new FirefoxProfile();
            }
            else
            {
                this.profile = profile;
            }

            if (binary == null)
            {
                this.process = new FirefoxBinary();
            }
            else
            {
                this.process = binary;
            }
        }

        /// <summary>
        /// Gets the <see cref="Uri"/> for communicating with this server.
        /// </summary>
        public Uri ExtensionUri
        {
            get { return this.extensionUri; }
        }

        /// <summary>
        /// Starts the server.
        /// </summary>
        public void Start()
        {
            using (ILock lockObject = new SocketLock(this.profile.Port - 1))
            {
                lockObject.LockObject(this.process.Timeout);
                try
                {
                    int portToUse = DetermineNextFreePort(this.host, this.profile.Port);
                    this.profile.Port = portToUse;
                    this.profile.WriteToDisk();
                    this.process.StartProfile(this.profile, new string[] { "-foreground" });

                    this.SetAddress(portToUse);

                    // TODO (JimEvans): Get a better url algorithm.
                    this.extensionUri = new Uri(string.Format(CultureInfo.InvariantCulture, "http://{0}:{1}/hub/", this.host, portToUse));
                    this.ConnectToBrowser(this.process.Timeout);
                }
                finally
                {
                    lockObject.UnlockObject();
                }
            }
        }

        /// <summary>
        /// Releases all resources used by the <see cref="FirefoxDriverServer"/>.
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases the unmanaged resources used by the <see cref="FirefoxDriverServer"/> and optionally
        /// releases the managed resources.
        /// </summary>
        /// <param name="disposing"><see langword="true"/> to release managed and resources;
        /// <see langword="false"/> to only release unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                // This should only be called after the QUIT command has been sent,
                // so go ahead and clean up our process and profile.
                this.process.Dispose();
                this.profile.Clean();
            }
        }

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
                    if (uniCast.Address.AddressFamily == AddressFamily.InterNetwork && IPAddress.IsLoopback(uniCast.Address))
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

            if (this.addresses.Count == 0)
            {
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Could not find any IPv4 addresses for host '{0}'", this.host));
            }
        }

        private void ConnectToBrowser(TimeSpan timeToWait)
        {
            // Attempt to connect to the browser extension on a Socket.
            // A successful connection means the browser is running and
            // the extension has been properly initialized.
            Socket extensionSocket = null;
            DateTime waitUntil = DateTime.Now.AddMilliseconds(timeToWait.TotalMilliseconds);
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
                        StringBuilder addressBuilder = new StringBuilder();
                        foreach (IPEndPoint address in this.addresses)
                        {
                            if (addressBuilder.Length > 0)
                            {
                                addressBuilder.Append(", ");
                            }

                            addressBuilder.AppendFormat(CultureInfo.InvariantCulture, "{0}:{1}", address.Address.ToString(), address.Port.ToString(CultureInfo.InvariantCulture));
                        }

                        throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Failed to start up socket within {0} milliseconds. Attempted to connect to the following addresses: {1}", timeToWait.TotalMilliseconds, addressBuilder.ToString()));
                    }
                    else
                    {
                        IPEndPoint endPoint = (IPEndPoint)extensionSocket.RemoteEndPoint;
                        string formattedError = string.Format(CultureInfo.InvariantCulture, "Unable to connect to host {0} on port {1} after {2} milliseconds", endPoint.Address.ToString(), endPoint.Port.ToString(CultureInfo.InvariantCulture), timeToWait.TotalMilliseconds);
                        throw new WebDriverException(formattedError);
                    }
                }
            }
            finally
            {
                extensionSocket.Close();
            }
        }
    }
}
