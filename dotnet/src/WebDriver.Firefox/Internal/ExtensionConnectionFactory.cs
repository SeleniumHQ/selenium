using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox.Internal
{
    /// <summary>
    /// Creates connections to a running instance of the WebDriver Firefox extension.
    /// </summary>
    internal static class ExtensionConnectionFactory
    {
        /// <summary>
        /// Connect to an instance of the WebDriver Firefox extension.
        /// </summary>
        /// <param name="binary">The <see cref="FirefoxBinary"/> in which the extension is hosted.</param>
        /// <param name="profile">The <see cref="FirefoxProfile"/> in which the extension is installed.</param>
        /// <param name="host">The host name of the computer running the extension (usually "localhost").</param>
        /// <returns>An <see cref="ExtensionConnection"/> connected to the WebDriver Firefox extension.</returns>
        /// <exception cref="WebDriverException">If there are any problems connecting to the extension.</exception>
        public static ExtensionConnection ConnectTo(FirefoxBinary binary, FirefoxProfile profile, string host)
        {
            int profilePort = profile.Port;
            ExtensionConnection connection = null;
            using (ILock lockObject = new SocketLock(profilePort - 1))
            {
                connection = new ExtensionConnection(lockObject, binary, profile, host);
            }

            return connection;
        }
    }
}
