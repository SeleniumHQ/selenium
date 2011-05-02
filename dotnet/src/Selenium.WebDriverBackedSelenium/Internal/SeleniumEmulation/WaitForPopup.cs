using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
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
