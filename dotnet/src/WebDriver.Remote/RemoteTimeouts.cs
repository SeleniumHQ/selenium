using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Defines the interface through which the user can define timeouts.
    /// </summary>
    internal class RemoteTimeouts : ITimeouts
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the RemoteTimeouts class
        /// </summary>
        /// <param name="driver">The driver that is currently in use</param>
        public RemoteTimeouts(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        #region ITimeouts Members
        /// <summary>
        /// Specifies the amount of time the driver should wait when searching for an
        /// element if it is not immediately present.
        /// </summary>
        /// <param name="timeToWait">A <see cref="TimeSpan"/> structure defining the amount of time to wait.</param>
        /// <returns>A self reference</returns>
        /// <remarks>
        /// When searching for a single element, the driver should poll the page
        /// until the element has been found, or this timeout expires before throwing
        /// a <see cref="NoSuchElementException"/>. When searching for multiple elements,
        /// the driver should poll the page until at least one element has been found
        /// or this timeout has expired.
        /// <para>
        /// Increasing the implicit wait timeout should be used judiciously as it
        /// will have an adverse effect on test run time, especially when used with
        /// slower location strategies like XPath.
        /// </para>
        /// </remarks>
        public ITimeouts ImplicitlyWait(TimeSpan timeToWait)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("ms", timeToWait.TotalMilliseconds);
            this.driver.InternalExecute(DriverCommand.ImplicitlyWait, parameters);
            return this;
        }

        /// <summary>
        /// Specifies the amount of time the driver should wait when executing JavaScript asynchronously.
        /// </summary>
        /// <param name="timeToWait">A <see cref="TimeSpan"/> structure defining the amount of time to wait.</param>
        /// <returns>A self reference</returns>
        public ITimeouts SetScriptTimeout(TimeSpan timeToWait)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("ms", timeToWait.TotalMilliseconds);
            this.driver.InternalExecute(DriverCommand.SetAsyncScriptTimeout, parameters);
            return this;
        }
        #endregion
    }
}
