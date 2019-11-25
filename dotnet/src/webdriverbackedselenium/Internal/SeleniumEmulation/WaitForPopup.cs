// <copyright file="WaitForPopup.cs" company="WebDriver Committers">
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

using System.Globalization;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the waitForPopup keyword.
    /// </summary>
    internal class WaitForPopup : SeleneseCommand
    {
        private WindowSelector windows;

        /// <summary>
        /// Initializes a new instance of the <see cref="WaitForPopup"/> class.
        /// </summary>
        /// <param name="windowSelector">An <see cref="WindowSelector"/> object used to select windows.</param>
        public WaitForPopup(WindowSelector windowSelector)
        {
            this.windows = windowSelector;
        }

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string waitMessage = string.Format(CultureInfo.InvariantCulture, "Timed out waiting for {0}. Waited {1}", locator, value);
            PopupWaiter waiter = new PopupWaiter(driver, locator, this.windows);
            if (!string.IsNullOrEmpty(value))
            {
                long millis = long.Parse(value, CultureInfo.InvariantCulture);
                waiter.Wait(waitMessage, millis);
            }
            else
            {
                waiter.Wait(waitMessage);
            }

            return null;
        }

        /// <summary>
        /// Provides methods to wait for a popup to appear.
        /// </summary>
        private class PopupWaiter : Waiter
        {
            private string windowId;
            private WindowSelector windows;
            private IWebDriver driver;

            /// <summary>
            /// Initializes a new instance of the <see cref="PopupWaiter"/> class.
            /// </summary>
            /// <param name="driver">The <see cref="IWebDriver"/> object to use to wait.</param>
            /// <param name="windowId">The window ID used to identify the window.</param>
            /// <param name="windows">The <see cref="WindowSelector"/> object used to select the window.</param>
            public PopupWaiter(IWebDriver driver, string windowId, WindowSelector windows)
                : base()
            {
                this.driver = driver;
                this.windowId = windowId;
                this.windows = windows;
            }

            /// <summary>
            /// The function called to wait for the condition
            /// </summary>
            /// <returns>Returns true when it's time to stop waiting.</returns>
            public override bool Until()
            {
                try
                {
                    if (this.windowId == "_blank")
                    {
                        this.windows.SelectBlankWindow(this.driver);
                    }
                    else
                    {
                        try
                        {
                            this.driver.SwitchTo().Window(this.windowId);
                        }
                        catch (NoSuchWindowException)
                        {
                            return false;
                        }
                    }

                    return this.driver.Url != "about:blank";
                }
                catch (SeleniumException)
                {
                    // Swallow
                }

                return false;
            }
        }
    }
}
