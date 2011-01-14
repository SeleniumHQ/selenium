using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class WaitForPageToLoad : SeleneseCommand
    {
        private int timeToWaitAfterPageLoad = 100;

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string waitMessage = "Failed to resolve " + locator;
            PageLoadWaiter waiter = new PageLoadWaiter(driver, timeToWaitAfterPageLoad);
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

        private class PageLoadWaiter : Waiter
        {
            private IWebDriver driver;
            private int timeToWaitAfterPageLoad;
            private DateTime started = DateTime.Now;

            public PageLoadWaiter(IWebDriver driver, int timeToWaitAfterPageLoad)
                : base()
            {
                this.driver = driver;
                this.timeToWaitAfterPageLoad = timeToWaitAfterPageLoad;
            }

            public override bool Until()
            {
                try
                {
                    object result = ((IJavaScriptExecutor)driver).ExecuteScript("return document['readyState'] ? 'complete' == document.readyState : true");

                    DateTime now = DateTime.Now;
                    if (result != null && result is bool && (bool)result)
                    {
                        if (now.Subtract(started).TotalMilliseconds > timeToWaitAfterPageLoad)
                        {
                            return true;
                        }
                    }
                    else
                    {
                        started = now;
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

