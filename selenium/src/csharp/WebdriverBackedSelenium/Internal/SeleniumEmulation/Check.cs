using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the check keyword.
    /// </summary>
    internal class Check : SeleneseCommand
    {
        private ElementFinder finder;
        private SeleniumOptionSelector selector;

        //public Check(ElementFinder elementFinder, SeleniumOptionSelector optionSelector)
        public Check(ElementFinder elementFinder)
        {
            finder = elementFinder;
            //selector = optionSelector;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            //if (locator.ToLowerInvariant().StartsWith("option "))
            //{
            //    selector.Select(driver, 
            //}
            IWebElement element = finder.FindElement(driver, locator);
            element.Select();
            return null;
        }
    }
}
