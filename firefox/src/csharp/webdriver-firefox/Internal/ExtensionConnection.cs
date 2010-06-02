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

                // TODO (JimEvans): Get a better url algorithm.
                executor = new HttpCommandExecutor(new Uri(string.Format(CultureInfo.InvariantCulture, "http://{0}:{1}/hub/", host, portToUse)));
            }
            finally
            {
                lockObject.UnlockObject();
            }
        } 
        #endregion

        #region IExtensionConnection Members
        /// <summary>
        /// Starts the connection to the extension.
        /// </summary>
        public void Start()
        {
            ConnectToBrowser(this.process.TimeoutInMilliseconds);
        }

        /// <summary>
        /// Closes the connection to the extension.
        /// </summary>
        public void Quit()
        {
            // This should only be called after the QUIT command has been sent,
            // so go ahead and clean up our process and profile.
            process.Quit();
            profile.Clean();
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
            return executor.Execute(commandToExecute);
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

                IPEndPoint address = new IPEndPoint(endPointAddress, newport);

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

        private static bool IsSocketConnected(Socket extensionSocket)
        {
            return extensionSocket != null && extensionSocket.Connected;
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
                addresses.Add(hostEndPoint);
            }
        }

        private void ConnectToBrowser(long timeToWaitInMilliSeconds)
        {
            // Attempt to connect to the browser extension on a Socket.
            // A successful connection means the browser is running and
            // the extension has been properly initialized.
            Socket extensionSocket = null;
            DateTime waitUntil = DateTime.Now.AddMilliseconds(timeToWaitInMilliSeconds);
            while (!IsSocketConnected(extensionSocket) && waitUntil > DateTime.Now)
            {
                foreach (IPEndPoint addr in addresses)
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
            // throw an exception. Otherwise, close the socket connection.
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
            else
            {
                extensionSocket.Close();
            }
        }
        #endregion
    }
}
