// <copyright file="RemoteOptions.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a mechanism for setting options needed for the driver during the test.
    /// </summary>
    internal class RemoteOptions : IOptions
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteOptions"/> class
        /// </summary>
        /// <param name="driver">Instance of the driver currently in use</param>
        public RemoteOptions(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        /// <summary>
        /// Gets an object allowing the user to manipulate cookies on the page.
        /// </summary>
        public ICookieJar Cookies
        {
            get { return new RemoteCookieJar(this.driver); }
        }

        /// <summary>
        /// Gets an object allowing the user to manipulate the currently-focused browser window.
        /// </summary>
        /// <remarks>"Currently-focused" is defined as the browser window having the window handle
        /// returned when IWebDriver.CurrentWindowHandle is called.</remarks>
        public IWindow Window
        {
            get { return new RemoteWindow(this.driver); }
        }

        /// <summary>
        /// Gets an object allowing the user to examine the logs of the current driver instance.
        /// </summary>
        public ILogs Logs
        {
            get { return new RemoteLogs(this.driver); }
        }

        /// <summary>
        /// Provides access to the timeouts defined for this driver.
        /// </summary>
        /// <returns>An object implementing the <see cref="ITimeouts"/> interface.</returns>
        public ITimeouts Timeouts()
        {
            return new RemoteTimeouts(this.driver);
        }
    }
}
