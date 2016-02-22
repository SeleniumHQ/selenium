// <copyright file="WaitForPageToLoad.cs" company="WebDriver Committers">
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
using System.Globalization;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the waitForPageToLoad keyword.
    /// </summary>
    internal class WaitForPageToLoad : SeleneseCommand
    {
        private int timeToWaitAfterPageLoad = 100;

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;
            if (executor == null)
            {
                // Assume that we Do The Right Thing
                return null;
            }

            long timeoutInMilliseconds = long.Parse(locator, CultureInfo.InvariantCulture);
           
            this.Pause();
            object result = executor.ExecuteScript("return !!document['readyState'];");
            Waiter wait = (result != null && (bool)result) ? new ReadyStateWaiter(driver) as Waiter : new LengthCheckingWaiter(driver) as Waiter;
            wait.Wait(string.Format(CultureInfo.InvariantCulture, "Failed to load page within {0} ms", locator), timeoutInMilliseconds);
            this.Pause();

            return null;
        }

        private void Pause()
        {
            System.Threading.Thread.Sleep(this.timeToWaitAfterPageLoad);
        }

        /// <summary>
        /// Provides methods to wait for the page ready state to be 'complete'.
        /// </summary>
        private class ReadyStateWaiter : Waiter
        {
            private IWebDriver driver;

            /// <summary>
            /// Initializes a new instance of the <see cref="ReadyStateWaiter"/> class.
            /// </summary>
            /// <param name="driver">The <see cref="IWebDriver"/> object to use to wait.</param>
            public ReadyStateWaiter(IWebDriver driver)
                : base()
            {
                this.driver = driver;
            }

            /// <summary>
            /// The function called to wait for the ready state to be 'complete'.
            /// </summary>
            /// <returns>Returns true when it's time to stop waiting.</returns>
            public override bool Until()
            {
                try
                {
                    object result = ((IJavaScriptExecutor)this.driver).ExecuteScript("return 'complete' == document.readyState;");

                    if (result != null && result is bool && (bool)result)
                    {
                        return true;
                    }
                }
                catch (Exception)
                {
                    // Possible page reload. Fine
                }

                return false;
            }
        }

        /// <summary>
        /// Provides methods to wait for the page body has a length other than zero.
        /// </summary>
        private class LengthCheckingWaiter : Waiter
        {
            private IWebDriver driver;
            private int length;
            private DateTime seenAt;

            /// <summary>
            /// Initializes a new instance of the <see cref="LengthCheckingWaiter"/> class.
            /// </summary>
            /// <param name="driver">The <see cref="IWebDriver"/> object to use to wait.</param>
            public LengthCheckingWaiter(IWebDriver driver)
            {
                this.driver = driver;
            }

            /// <summary>
            /// The function called to wait for the body text length to be greater than zero.
            /// </summary>
            /// <returns>Returns true when it's time to stop waiting.</returns>
            public override bool Until()
            {
                // Page length needs to be stable for a second
                try
                {
                    int currentLength = this.driver.FindElement(By.TagName("body")).Text.Length;
                    if (this.seenAt == null)
                    {
                        this.seenAt = DateTime.Now;
                        this.length = currentLength;
                        return false;
                    }

                    if (currentLength != this.length)
                    {
                        this.seenAt = DateTime.Now;
                        this.length = currentLength;
                        return false;
                    }

                    return DateTime.Now.Subtract(this.seenAt).TotalMilliseconds > 1000;
                }
                catch (NoSuchElementException)
                {
                }

                return false;
            }
        }
    }
}