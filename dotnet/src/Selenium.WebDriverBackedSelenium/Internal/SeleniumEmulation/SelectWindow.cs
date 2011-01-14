using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class SelectWindow : SeleneseCommand
    {
        private WindowSelector windows;

        public SelectWindow(WindowSelector windowSelector)
        {
            windows = windowSelector;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            windows.SelectWindow(driver, locator);
            return null;
        }
    }
}
