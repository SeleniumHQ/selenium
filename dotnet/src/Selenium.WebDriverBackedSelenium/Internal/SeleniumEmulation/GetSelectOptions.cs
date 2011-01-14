using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetSelectOptions : SeleneseCommand
    {
        private SeleniumOptionSelector selector;

        public GetSelectOptions(SeleniumOptionSelector optionsSelector)
        {
            selector = optionsSelector;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            List<string> allOptions = selector.GetOptions(driver, locator, SeleniumOptionSelector.Property.Text, true);

            return allOptions.ToArray();
        }
    }
}
