using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a mechanism for setting options needed for the driver during the test.
    /// </summary>
    internal class RemoteOptions : IOptions
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the RemoteOptions class
        /// </summary>
        /// <param name="driver">Instance of the driver currently in use</param>
        public RemoteOptions(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        #region IOptions
        /// <summary>
        /// Gets an object allowing the user to manipulate cookies on the page.
        /// </summary>
        public ICookieJar Cookies
        {
            get { return new RemoteCookieJar(this.driver); }
        }

        /// <summary>
        /// Provides access to the timeouts defined for this driver.
        /// </summary>
        /// <returns>An object implementing the <see cref="ITimeouts"/> interface.</returns>
        public ITimeouts Timeouts()
        {
            return new RemoteTimeouts(this.driver);
        }
        #endregion
    }
}
