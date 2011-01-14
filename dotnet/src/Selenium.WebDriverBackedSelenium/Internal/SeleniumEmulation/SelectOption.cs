using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class SelectOption : SeleneseCommand
    {
        private SeleniumOptionSelector selector;

        public SelectOption(SeleniumOptionSelector optionSelector)
        {
            selector = optionSelector;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            selector.Select(driver, locator, value, true, true);
            return null;
        }
    }
}
