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
            if (!(driver is IJavaScriptExecutor))
            {
                // Assume that we Do The Right Thing
                return null;
            }

            long timeoutInMilliseconds = long.Parse(locator);
           
            this.Pause();
            object result = ((IJavaScriptExecutor)driver).ExecuteScript("return !!document['readyState'];");
            Waiter wait = (result != null && (bool)result) ? new ReadyStateWaiter(driver) as Waiter : new LengthCheckingWaiter(driver) as Waiter;
            wait.Wait(String.Format("Failed to load page within {0} ms", locator), timeoutInMilliseconds);
            this.Pause();

            return null;
        }

        private void Pause()
        {
            System.Threading.Thread.Sleep(this.timeToWaitAfterPageLoad);
        }

        private class ReadyStateWaiter : Waiter
        {
            IWebDriver driver;
            public ReadyStateWaiter(IWebDriver driver)
                : base()
            {
                this.driver = driver;
            }

            public override bool Until()
            {
                try
                {
                    object result = ((IJavaScriptExecutor)driver).ExecuteScript("return 'complete' == document.readyState;");

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

        private class LengthCheckingWaiter : Waiter
        {
            private IWebDriver driver;
            private int length;
            private DateTime seenAt;

            public LengthCheckingWaiter(IWebDriver driver)
            {
                this.driver = driver;
            }

            public override bool Until()
            {
                // Page length needs to be stable for a second
                try
                {
                    int currentLength = driver.FindElement(By.TagName("body")).Text.Length;
                    if (seenAt == null)
                    {
                        this.seenAt = DateTime.Now;
                        this.length = currentLength;
                        return false;
                    }

                    if (currentLength != length)
                    {
                        this.seenAt = DateTime.Now;
                        this.length = currentLength;
                        return false;
                    }

                    return DateTime.Now.Subtract(seenAt).TotalMilliseconds > 1000;
                }
                catch (NoSuchElementException) { }

                return false;
            }
        }
    }
}

