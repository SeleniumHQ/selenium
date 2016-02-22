// <copyright file="WebDriverWait.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// Provides the ability to wait for an arbitrary condition during test execution.
    /// </summary>
    /// <example>
    /// <code>
    /// IWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(3))
    /// IWebElement element = wait.Until(driver => driver.FindElement(By.Name("q")));
    /// </code>
    /// </example>
    public class WebDriverWait : DefaultWait<IWebDriver>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverWait"/> class.
        /// </summary>
        /// <param name="driver">The WebDriver instance used to wait.</param>
        /// <param name="timeout">The timeout value indicating how long to wait for the condition.</param>
        public WebDriverWait(IWebDriver driver, TimeSpan timeout)
            : this(new SystemClock(), driver, timeout, DefaultSleepTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverWait"/> class.
        /// </summary>
        /// <param name="clock">An object implementing the <see cref="IClock"/> interface used to determine when time has passed.</param>
        /// <param name="driver">The WebDriver instance used to wait.</param>
        /// <param name="timeout">The timeout value indicating how long to wait for the condition.</param>
        /// <param name="sleepInterval">A <see cref="TimeSpan"/> value indicating how often to check for the condition to be true.</param>
        public WebDriverWait(IClock clock, IWebDriver driver, TimeSpan timeout, TimeSpan sleepInterval)
            : base(driver, clock)
        {
            this.Timeout = timeout;
            this.PollingInterval = sleepInterval;
            this.IgnoreExceptionTypes(typeof(NotFoundException));
        }

        private static TimeSpan DefaultSleepTimeout
        {
            get { return TimeSpan.FromMilliseconds(500); }
        }
    }
}