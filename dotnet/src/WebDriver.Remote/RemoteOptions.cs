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
        /// Method for creating a cookie in the browser
        /// </summary>
        /// <param name="cookie"><see cref="Cookie"/> that represents a cookie in the browser</param>
        public void AddCookie(Cookie cookie)
        {
            this.Cookies.AddCookie(cookie);
        }

        /// <summary>
        /// Delete the cookie by passing in the name of the cookie
        /// </summary>
        /// <param name="name">The name of the cookie that is in the browser</param>
        public void DeleteCookieNamed(string name)
        {
            this.Cookies.DeleteCookieNamed(name);
        }

        /// <summary>
        /// Delete a cookie in the browser by passing in a copy of a cookie
        /// </summary>
        /// <param name="cookie">An object that represents a copy of the cookie that needs to be deleted</param>
        public void DeleteCookie(Cookie cookie)
        {
            this.Cookies.DeleteCookie(cookie);
        }

        /// <summary>
        /// Delete All Cookies that are present in the browser
        /// </summary>
        public void DeleteAllCookies()
        {
            this.Cookies.DeleteAllCookies();
        }

        /// <summary>
        /// Method for returning a getting a cookie by name
        /// </summary>
        /// <param name="name">name of the cookie that needs to be returned</param>
        /// <returns>A Cookie from the name</returns>
        public Cookie GetCookieNamed(string name)
        {
            return this.Cookies.GetCookieNamed(name);
        }

        /// <summary>
        /// Method for getting a Collection of Cookies that are present in the browser
        /// </summary>
        /// <returns>ReadOnlyCollection of Cookies in the browser</returns>
        public ReadOnlyCollection<Cookie> GetCookies()
        {
            return this.Cookies.AllCookies;
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
