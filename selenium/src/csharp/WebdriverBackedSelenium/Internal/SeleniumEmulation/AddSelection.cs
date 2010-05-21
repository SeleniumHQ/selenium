using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the addSelection keyword.
    /// </summary>
    internal class AddSelection : SeleneseCommand
    {
        private ElementFinder finder;
        private SeleniumOptionSelector selector;

        public AddSelection(ElementFinder elementFinder, SeleniumOptionSelector optionSelector)
        {
            finder = elementFinder;
            selector = optionSelector;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            if (!SeleniumOptionSelector.IsMultiSelect(element))
            {
                throw new SeleniumException("You may only add a selection to a select that supports multiple selections");
            }

            selector.Select(driver, locator, value, true, false);
            return null;
        }
    }
}
