using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox.Internal
{
    internal static class ExtensionConnectionFactory
    {
        public static ExtensionConnection ConnectTo(FirefoxBinary binary, FirefoxProfile profile, String host)
        {
            int profilePort = profile.Port;
            try
            {
                ExtensionConnection connection = null;
                using (ILock lockObject = new SocketLock(profilePort - 1))
                {
                    connection = new ExtensionConnection(lockObject, binary, profile, host);
                }

                return connection;
            }
            catch (Exception e)
            {
                throw new WebDriverException(e.Message, e);
            }
        }
    }
}
