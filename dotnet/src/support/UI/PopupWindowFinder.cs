// <copyright file="PopupWindowFinder.cs" company="WebDriver Committers">
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
using System.Linq;

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// Provides a mechanism by which the window handle of an invoked
    /// popup browser window may be determined.
    /// </summary>
    /// <example>
    /// <code>
    /// // Store the current window handle so you can switch back to the
    /// // original window when you close the popup.
    /// string current = driver.CurrentWindowHandle;
    /// PopupWindowFinder finder = new PopupWindowFinder(driver);
    /// string newHandle = finder.Click(driver.FindElement(By.LinkText("Open new window")));
    /// driver.SwitchTo.Window(newHandle);
    /// </code>
    /// </example>
    public class PopupWindowFinder
    {
        private readonly IWebDriver driver;
        private readonly TimeSpan timeout;
        private readonly TimeSpan sleepInterval;

        /// <summary>
        /// Initializes a new instance of the <see cref="PopupWindowFinder"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> instance that is used
        /// to manipulate the popup window.</param>
        /// <remarks>When using this constructor overload, the timeout will be 5 seconds,
        /// and the check for a new window will be performed every 250 milliseconds.</remarks>
        public PopupWindowFinder(IWebDriver driver)
            : this(driver, DefaultTimeout, DefaultSleepInterval)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PopupWindowFinder"/> class
        /// with the specified timeout.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> instance that is used
        /// to manipulate the popup window.</param>
        /// <param name="timeout">The <see cref="TimeSpan"/> representing the amount of
        /// time to wait for the popup window to appear.</param>
        /// <remarks>When using this constructor overload, the check for a new window
        /// will be performed every 250 milliseconds.</remarks>
        public PopupWindowFinder(IWebDriver driver, TimeSpan timeout)
            : this(driver, timeout, DefaultSleepInterval)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PopupWindowFinder"/> class
        /// with the specified timeout and using the specified interval to check for
        /// the existence of the new window.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> instance that is used
        /// to manipulate the popup window.</param>
        /// <param name="timeout">The <see cref="TimeSpan"/> representing the amount of
        /// time to wait for the popup window to appear.</param>
        /// <param name="sleepInterval">The <see cref="TimeSpan"/> representing the
        /// amount of time to wait between checks of the available window handles.</param>
        public PopupWindowFinder(IWebDriver driver, TimeSpan timeout, TimeSpan sleepInterval)
        {
            this.driver = driver;
            this.timeout = timeout;
            this.sleepInterval = sleepInterval;
        }

        private static TimeSpan DefaultTimeout
        {
            get { return TimeSpan.FromSeconds(5); }
        }

        private static TimeSpan DefaultSleepInterval
        {
            get { return TimeSpan.FromMilliseconds(250); }
        }

        /// <summary>
        /// Clicks on an element that is expected to trigger a popup browser window.
        /// </summary>
        /// <param name="element">The <see cref="IWebElement"/> that, when clicked, invokes
        /// the popup browser window.</param>
        /// <returns>The window handle of the popup browser window.</returns>
        /// <exception cref="WebDriverTimeoutException">Thrown if no popup window appears within the specified timeout.</exception>
        /// <exception cref="ArgumentNullException">Thrown if the element to click is <see langword="null"/>.</exception>
        public string Click(IWebElement element)
        {
            if (element == null)
            {
                throw new ArgumentNullException("element", "element cannot be null");
            }

            return this.Invoke(() => { element.Click(); });
        }

        /// <summary>
        /// Invokes a method that is expected to trigger a popup browser window.
        /// </summary>
        /// <param name="popupMethod">An <see cref="Action"/> that, when run, invokes
        /// the popup browser window.</param>
        /// <returns>The window handle of the popup browser window.</returns>
        /// <exception cref="WebDriverTimeoutException">Thrown if no popup window appears within the specified timeout.</exception>
        /// <exception cref="ArgumentNullException">Thrown if the action to invoke is <see langword="null"/>.</exception>
        public string Invoke(Action popupMethod)
        {
            if (popupMethod == null)
            {
                throw new ArgumentNullException("popupMethod", "popupMethod cannot be null");
            }

            IList<string> existingHandles = this.driver.WindowHandles;
            popupMethod();
            WebDriverWait wait = new WebDriverWait(new SystemClock(), this.driver, this.timeout, this.sleepInterval);
            string popupHandle = wait.Until<string>((d) =>
            {
                string foundHandle = null;
                IList<string> differentHandles = GetDifference(existingHandles, this.driver.WindowHandles);
                if (differentHandles.Count > 0)
                {
                    foundHandle = differentHandles[0];
                }

                return foundHandle;
            });

            return popupHandle;
        }

        private static IList<string> GetDifference(IList<string> existingHandles, IList<string> currentHandles)
        {
            // We are using LINQ to get the difference between the two lists.
            // The non-LINQ version looks like the following:
            // IList<string> differentHandles = new List<string>();
            // foreach (string handle in currentHandles)
            // {
            //    if (!existingHandles.Contains(handle))
            //    {
            //        currentHandles.Add(handle);
            //    }
            // }
            // return differentHandles;
            return currentHandles.Except(existingHandles).ToList();
        }
    }
}
