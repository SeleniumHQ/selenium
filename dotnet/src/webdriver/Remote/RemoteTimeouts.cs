// <copyright file="RemoteTimeouts.cs" company="WebDriver Committers">
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
using System.Collections.Generic;
using System.Globalization;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Defines the interface through which the user can define timeouts.
    /// </summary>
    internal class RemoteTimeouts : ITimeouts
    {
        private const string ImplicitTimeoutName = "implicit";
        private const string AsyncScriptTimeoutName = "script";
        private const string PageLoadTimeoutName = "pageLoad";
        private const string LegacyPageLoadTimeoutName = "page load";

        private readonly TimeSpan DefaultImplicitWaitTimeout = TimeSpan.FromSeconds(0);
        private readonly TimeSpan DefaultAsyncScriptTimeout = TimeSpan.FromSeconds(30);
        private readonly TimeSpan DefaultPageLoadTimeout = TimeSpan.FromSeconds(300);

        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteTimeouts"/> class
        /// </summary>
        /// <param name="driver">The driver that is currently in use</param>
        public RemoteTimeouts(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        /// <summary>
        /// Gets or sets the implicit wait timeout, which is the  amount of time the
        /// driver should wait when searching for an element if it is not immediately
        /// present.
        /// </summary>
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
        public TimeSpan ImplicitWait
        {
            get { return this.ExecuteGetTimeout(ImplicitTimeoutName); }
            set { this.ExecuteSetTimeout(ImplicitTimeoutName, value); }
        }

        /// <summary>
        /// Gets or sets the asynchronous script timeout, which is the amount
        /// of time the driver should wait when executing JavaScript asynchronously.
        /// This timeout only affects the <see cref="IJavaScriptExecutor.ExecuteAsyncScript(string, object[])"/>
        /// method.
        /// </summary>
        public TimeSpan AsynchronousJavaScript
        {
            get { return this.ExecuteGetTimeout(AsyncScriptTimeoutName); }
            set { this.ExecuteSetTimeout(AsyncScriptTimeoutName, value); }
        }

        /// <summary>
        /// Gets or sets the page load timeout, which is the amount of time the driver
        /// should wait for a page to load when setting the <see cref="IWebDriver.Url"/>
        /// property.
        /// </summary>
        public TimeSpan PageLoad
        {
            get
            {
                string timeoutName = PageLoadTimeoutName;
                return this.ExecuteGetTimeout(timeoutName);
            }

            set
            {
                string timeoutName = PageLoadTimeoutName;
                this.ExecuteSetTimeout(timeoutName, value);
            }
        }

        private TimeSpan ExecuteGetTimeout(string timeoutType)
        {
            Response commandResponse = this.driver.InternalExecute(DriverCommand.GetTimeouts, null);
            Dictionary<string, object> responseValue = (Dictionary<string, object>)commandResponse.Value;
            if (!responseValue.ContainsKey(timeoutType))
            {
                throw new WebDriverException("Specified timeout type not defined");
            }

            return TimeSpan.FromMilliseconds(Convert.ToDouble(responseValue[timeoutType], CultureInfo.InvariantCulture));
        }

        private void ExecuteSetTimeout(string timeoutType, TimeSpan timeToWait)
        {
            double milliseconds = timeToWait.TotalMilliseconds;
            if (timeToWait == TimeSpan.MinValue)
            {
                if (timeoutType == ImplicitTimeoutName)
                {
                    milliseconds = DefaultImplicitWaitTimeout.TotalMilliseconds;
                }
                else if (timeoutType == AsyncScriptTimeoutName)
                {
                    milliseconds = DefaultAsyncScriptTimeout.TotalMilliseconds;
                }
                else
                {
                    milliseconds = DefaultPageLoadTimeout.TotalMilliseconds;
                }
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add(timeoutType, Convert.ToInt64(milliseconds));
            this.driver.InternalExecute(DriverCommand.SetTimeouts, parameters);
        }
    }
}
