using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class FindFirstSelectedOptionProperty : SeleneseCommand
    {
        private SeleniumOptionSelector selector;
        private SeleniumOptionSelector.Property property;

        public FindFirstSelectedOptionProperty(SeleniumOptionSelector optionSelect, SeleniumOptionSelector.Property property)
        {
            this.selector = optionSelect;
            this.property = property;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            List<string> options = selector.GetOptions(driver, locator, property, false);
            return options[0];
        }
    }
}
