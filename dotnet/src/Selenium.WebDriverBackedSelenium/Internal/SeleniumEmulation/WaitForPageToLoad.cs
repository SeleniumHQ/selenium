using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
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
            string waitMessage = "Failed to resolve " + locator;
            PageLoadWaiter waiter = new PageLoadWaiter(driver, this.timeToWaitAfterPageLoad);
            if (!string.IsNullOrEmpty(value))
            {
                waiter.Wait(waitMessage, long.Parse(value, CultureInfo.InvariantCulture));
            }
            else
            {
                waiter.Wait(waitMessage);
            }

            return null;
        }

        /// <summary>
        /// Provides methods to wait for a page to load.
        /// </summary>
        private class PageLoadWaiter : Waiter
        {
            private IWebDriver driver;
            private int timeToWaitAfterPageLoad;
            private DateTime started = DateTime.Now;

            /// <summary>
            /// Initializes a new instance of the <see cref="PageLoadWaiter"/> class.
            /// </summary>
            /// <param name="driver">The <see cref="IWebDriver"/> object to use to wait.</param>
            /// <param name="timeToWaitAfterPageLoad">The time to wait after the page loads.</param>
            public PageLoadWaiter(IWebDriver driver, int timeToWaitAfterPageLoad)
                : base()
            {
                this.driver = driver;
                this.timeToWaitAfterPageLoad = timeToWaitAfterPageLoad;
            }

            /// <summary>
            /// The function called to wait for the condition
            /// </summary>
            /// <returns>Returns true when it's time to stop waiting.</returns>
            public override bool Until()
            {
                try
                {
                    object result = ((IJavaScriptExecutor)this.driver).ExecuteScript("return document['readyState'] ? 'complete' == document.readyState : true");

                    DateTime now = DateTime.Now;
                    if (result != null && result is bool && (bool)result)
                    {
                        if (now.Subtract(this.started).TotalMilliseconds > this.timeToWaitAfterPageLoad)
                        {
                            return true;
                        }
                    }
                    else
                    {
                        this.started = now;
                    }
                }
                catch (Exception)
                {
                    // Possible page reload. Fine
                }

                return false;
            }
        }
    }
}

