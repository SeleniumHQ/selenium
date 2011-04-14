using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a mechanism for Navigating with the driver.
    /// </summary>
    internal class RemoteNavigator : INavigation
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the RemoteNavigator class
        /// </summary>
        /// <param name="driver">Driver in use</param>
        public RemoteNavigator(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        #region INavigation members
        /// <summary>
        /// Move the browser back
        /// </summary>
        public void Back()
        {
            this.driver.InternalExecute(DriverCommand.GoBack, null);
        }

        /// <summary>
        /// Move the browser forward
        /// </summary>
        public void Forward()
        {
            this.driver.InternalExecute(DriverCommand.GoForward, null);
        }

        /// <summary>
        /// Navigate to a url for your test
        /// </summary>
        /// <param name="url">String of where you want the browser to go to</param>
        public void GoToUrl(string url)
        {
            this.driver.Url = url;
        }

        /// <summary>
        /// Navigate to a url for your test
        /// </summary>
        /// <param name="url">Uri object of where you want the browser to go to</param>
        public void GoToUrl(Uri url)
        {
            if (url == null)
            {
                throw new ArgumentNullException("url", "URL cannot be null.");
            }

            this.driver.Url = url.ToString();
        }

        /// <summary>
        /// Refresh the browser
        /// </summary>
        public void Refresh()
        {
            // driver.SwitchTo().DefaultContent();
            this.driver.InternalExecute(DriverCommand.Refresh, null);
        }
        #endregion
    }
}
