using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class WaitForPopup : SeleneseCommand
    {
        private WindowSelector windows;

        public WaitForPopup(WindowSelector windowSelector)
        {
            windows = windowSelector;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string waitMessage = string.Format(CultureInfo.InvariantCulture, "Timed out waiting for {0}. Waited {1}", locator, value);
            string current = driver.GetWindowHandle();
            PopupWaiter waiter = new PopupWaiter(driver, locator, windows);
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

        private class PopupWaiter : Waiter
        {
            private string windowId;
            private WindowSelector windows;
            private IWebDriver driver;

            public PopupWaiter(IWebDriver driver, string windowId, WindowSelector windows) : base()
            {
                this.driver = driver;
                this.windowId = windowId;
                this.windows = windows;
            }

            public override bool Until()
            {
                try
                {
                    if (windowId == "_blank")
                    {
                        windows.SelectBlankWindow(driver);
                    }
                    else
                    {
                        driver.SwitchTo().Window(windowId);
                    }

                    return driver.Url != "about:blank";
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
