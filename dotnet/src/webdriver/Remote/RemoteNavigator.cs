// <copyright file="RemoteNavigator.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a mechanism for Navigating with the driver.
    /// </summary>
    internal class RemoteNavigator : INavigation
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteNavigator"/> class
        /// </summary>
        /// <param name="driver">Driver in use</param>
        public RemoteNavigator(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

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
    }
}
