// <copyright file="SocketLock.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;

namespace OpenQA.Selenium.Firefox.Internal
{
    /// <summary>
    /// Provides a mutex-like lock on a socket.
    /// </summary>
    internal class SocketLock : ILock
    {
        private static int delayBetweenSocketChecks = 100;

        private int lockPort;
        private Socket lockSocket;

        /// <summary>
        /// Initializes a new instance of the <see cref="SocketLock"/> class.
        /// </summary>
        /// <param name="lockPort">Port to use to acquire the lock.</param>
        /// <remarks>The <see cref="SocketLock"/> class will attempt to acquire the
        /// specified port number, and wait for it to become free.</remarks>
        public SocketLock(int lockPort)
        {
            this.lockPort = lockPort;
            this.lockSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            this.PreventSocketInheritance();
        }

        /// <summary>
        /// Locks the mutex port.
        /// </summary>
        /// <param name="timeout">The <see cref="TimeSpan"/> describing the amount of time to wait for
        /// the mutex port to become available.</param>
        public void LockObject(TimeSpan timeout)
        {
            IPHostEntry hostEntry = Dns.GetHostEntry("localhost");

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

            IPEndPoint address = new IPEndPoint(endPointAddress, this.lockPort);

            // Calculate the 'exit time' for our wait loop.
            DateTime maxWait = DateTime.Now.Add(timeout);

            // Attempt to acquire the lock until something goes wrong or we run out of time.
            do
            {
                try
                {
                    if (this.IsLockFree(address))
                    {
                        return;
                    }

                    Thread.Sleep(delayBetweenSocketChecks);
                }
                catch (ThreadInterruptedException e)
                {
                    throw new WebDriverException("the thread was interrupted", e);
                }
                catch (IOException e)
                {
                    throw new WebDriverException("An unexpected error occurred", e);
                }
            }
            while (DateTime.Now < maxWait);

            throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Unable to bind to locking port {0} within {1} milliseconds", this.lockPort, timeout.TotalMilliseconds));
        }

        /// <summary>
        /// Locks the mutex port.
        /// </summary>
        /// <param name="timeoutInMilliseconds">The amount of time (in milliseconds) to wait for
        /// the mutex port to become available.</param>
        [Obsolete("Timeouts should be expressed as a TimeSpan. Use the LockObject overload taking a TimeSpan parameter instead")]
        public void LockObject(long timeoutInMilliseconds)
        {
            this.LockObject(TimeSpan.FromMilliseconds(timeoutInMilliseconds));
        }

        /// <summary>
        /// Unlocks the mutex port.
        /// </summary>
        public void UnlockObject()
        {
            try
            {
                this.lockSocket.Close();
            }
            catch (IOException e)
            {
                throw new WebDriverException("An error occured unlocking the object", e);
            }
        }

        /// <summary>
        /// Releases all resources associated with this <see cref="SocketLock"/>
        /// </summary>
        public void Dispose()
        {
            if (this.lockSocket != null && this.lockSocket.Connected)
            {
                this.lockSocket.Close();
            }

            GC.SuppressFinalize(this);
        }

        private bool IsLockFree(IPEndPoint address)
        {
            try
            {
                this.lockSocket.Bind(address);
                return true;
            }
            catch (SocketException)
            {
                return false;
            }
        }

        private void PreventSocketInheritance()
        {
            // TODO (JimEvans): Handle the non-Windows case.
            if (Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                NativeMethods.SetHandleInformation(this.lockSocket.Handle, NativeMethods.HandleInformation.Inherit | NativeMethods.HandleInformation.ProtectFromClose, NativeMethods.HandleInformation.None);
            }
        }
    }
}
