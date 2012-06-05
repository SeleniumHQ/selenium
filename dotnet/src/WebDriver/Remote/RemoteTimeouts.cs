// <copyright file="RemoteTimeouts.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
            // The *correct* approach to this timeout is to use the below
            // commented line of code and remove the remainder of this method.
            // However, we need to use the hard-coded timeout commmand for now,
            // since all drivers don't yet understand the generic "timeouts"
            // command endpoint.
            // this.ExecuteSetTimeout("implicit", timeToWait);
            double milliseconds = timeToWait.TotalMilliseconds;
            if (timeToWait == TimeSpan.MinValue)
            {
                milliseconds = -1;
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("ms", milliseconds);
            this.driver.InternalExecute(DriverCommand.ImplicitlyWait, parameters);
            return this;
        }

        /// <summary>
        /// Specifies the amount of time the driver should wait when executing JavaScript asynchronously.
        /// </summary>
        /// <param name="timeToWait">A <see cref="TimeSpan"/> structure defining the amount of time to wait.
        /// Setting this parameter to <see cref="TimeSpan.MinValue"/> will allow the script to run indefinitely.</param>
        /// <returns>A self reference</returns>
        public ITimeouts SetScriptTimeout(TimeSpan timeToWait)
        {
            // The *correct* approach to this timeout is to use the below
            // commented line of code and remove the remainder of this method.
            // However, we need to use the hard-coded timeout commmand for now,
            // since all drivers don't yet understand the generic "timeouts"
            // command endpoint.
            // this.ExecuteSetTimeout("script", timeToWait);
            double milliseconds = timeToWait.TotalMilliseconds;
            if (timeToWait == TimeSpan.MinValue)
            {
                milliseconds = -1;
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("ms", milliseconds);
            this.driver.InternalExecute(DriverCommand.SetAsyncScriptTimeout, parameters);
            return this;
        }

        /// <summary>
        /// Specifies the amount of time the driver should wait for a page to load when setting the <see cref="IWebDriver.Url"/> property.
        /// </summary>
        /// <param name="timeToWait">A <see cref="TimeSpan"/> structure defining the amount of time to wait.
        /// Setting this parameter to <see cref="TimeSpan.MinValue"/> will allow the page to load indefinitely.</param>
        /// <returns>A self reference</returns>
        public ITimeouts SetPageLoadTimeout(TimeSpan timeToWait)
        {
            this.ExecuteSetTimeout("page load", timeToWait);
            return this;
        }
        #endregion

        private void ExecuteSetTimeout(string timeoutType, TimeSpan timeToWait)
        {
            double milliseconds = timeToWait.TotalMilliseconds;
            if (timeToWait == TimeSpan.MinValue)
            {
                milliseconds = -1;
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("type", timeoutType);
            parameters.Add("ms", milliseconds);
            this.driver.InternalExecute(DriverCommand.SetTimeout, parameters);
        }
    }
}
