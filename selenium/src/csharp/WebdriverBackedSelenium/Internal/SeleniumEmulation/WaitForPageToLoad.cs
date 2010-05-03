using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class WaitForPageToLoad : SeleneseCommand
    {
        private int timeToWaitAfterPageLoad = 100;

        public int TimeToWaitAfterPageLoad
        {
            get { return timeToWaitAfterPageLoad; }
            set { timeToWaitAfterPageLoad = value; }
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            PageLoadWaiter waiter = new PageLoadWaiter(driver, locator, timeToWaitAfterPageLoad);
            waiter.Wait("Failed to resolve " + locator, long.Parse(value));
            return null;
        }

        private class PageLoadWaiter : Waiter
        {
            private IWebDriver driver;
            private string script;
            private int timeToWaitAfterPageLoad;
            private DateTime started = DateTime.Now;

            public PageLoadWaiter(IWebDriver driver, string script, int timeToWaitAfterPageLoad)
                : base()
            {
                this.driver = driver;
                this.script = script;
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

