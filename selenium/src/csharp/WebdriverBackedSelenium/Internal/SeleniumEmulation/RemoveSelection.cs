using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class RemoveSelection : SeleneseCommand
    {
        private ElementFinder finder;
        private SeleniumOptionSelector selector;

        public RemoveSelection(ElementFinder elementFinder, SeleniumOptionSelector optionSelector)
        {
            finder = elementFinder;
            selector = optionSelector;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            if (!SeleniumOptionSelector.IsMultiSelect(element))
            {
                throw new SeleniumException("You may only remove a selection to a select that supports multiple selections");
            }

            selector.Select(driver, locator, value, false, false);

            return null;
        }
    }
}
