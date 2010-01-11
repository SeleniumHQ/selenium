using System;
using System.Collections.Generic;
using System.Text;
using System.Net.Sockets;
using System.Net;
using System.Threading;
using System.IO;

namespace OpenQA.Selenium.Firefox.Internal
{
    internal class SocketLock : ILock
    {
        private static int DelayBetweenSocketChecks = 100;

        private int lockPort;
        private Socket lockSocket;

        /**
         * Constructs a new SocketLock.  Attempts to lock the lock will attempt to acquire the
         * specified port number, and wait for it to become free.
         * 
         * @param lockPort the port number to lock
         */
        public SocketLock(int lockPort)
        {
            this.lockPort = lockPort;
            lockSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
        }

        /**
         * @inheritDoc
         */
        public void LockObject(long timeoutInMilliseconds)
        {
            IPHostEntry hostEntry = Dns.GetHostEntry("localhost");
            IPEndPoint address = new IPEndPoint(hostEntry.AddressList[0], lockPort);

            // Calculate the 'exit time' for our wait loop.
            DateTime maxWait = DateTime.Now.AddMilliseconds(timeoutInMilliseconds);

            // Attempt to acquire the lock until something goes wrong or we run out of time.
            do
            {
                try
                {
                    if (isLockFree(address))
                        return;
                    Thread.Sleep(DelayBetweenSocketChecks);
                }
                catch (ThreadInterruptedException e)
                {
                    throw new WebDriverException("the thread was interrupted", e);
                }
                catch (IOException e)
                {
                    throw new WebDriverException("An unexpected error occured", e);
                }
            } while (DateTime.Now < maxWait);

            throw new WebDriverException(
                string.Format("Unable to bind to locking port {0} within {1} ms", lockPort, timeoutInMilliseconds));
        }

        /**
         * @inheritDoc
         */
        public void UnlockObject()
        {
            try
            {
                if (lockSocket.IsBound)
                {
                    lockSocket.Close();
                }
            }
            catch (IOException e)
            {
                throw new WebDriverException("An error occured unlocking the object", e);
            }
        }

        /**
         * Test to see if the lock is free.  Returns instantaneously.
         * 
         * @param address the address to attempt to bind to
         * @return true if the lock is locked; false if it is not
         * @throws IOException if something goes catastrophically wrong with the socket
         */
        private bool isLockFree(IPEndPoint address)
        {
            try
            {
                lockSocket.Bind(address);
                return true;
            }
            catch (SocketException)
            {
                return false;
            }
        }
    }
}
