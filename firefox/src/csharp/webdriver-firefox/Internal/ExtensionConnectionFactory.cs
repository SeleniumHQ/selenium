using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox.Internal
{
    internal class ExtensionConnectionFactory
    {
        public static ExtensionConnection ConnectTo(FirefoxBinary binary, FirefoxProfile profile, String host)
        {
            int profilePort = profile.Port;
            try
            {
                ILock lockObject = new SocketLock(profilePort - 1);
                return new ExtensionConnection(lockObject, binary, profile, host);
            }
            catch (Exception e)
            {
                throw new WebDriverException(e.Message, e);
            }
        }
    }
}
