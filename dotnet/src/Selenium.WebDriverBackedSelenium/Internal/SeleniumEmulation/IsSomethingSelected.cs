using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class IsSomethingSelected : SeleneseCommand
    {
        private SeleniumOptionSelector selector;

        public IsSomethingSelected(SeleniumOptionSelector optionSelector)
        {
            selector = optionSelector;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            List<string> values = selector.GetOptions(driver, locator, SeleniumOptionSelector.Property.Text, false);
            return values.Count > 0;
        }
    }
}
