using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the click keyword.
    /// </summary>
    internal class Click : SeleneseCommand
    {
        private ElementFinder finder;

        public Click(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            element.Click();
            return null;
        }
    }
}
