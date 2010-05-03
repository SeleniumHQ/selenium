using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class IsEditable : SeleneseCommand
    {
        private ElementFinder finder;

        public IsEditable(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            string tagName = element.TagName.ToLowerInvariant();
            bool acceptableTagName = tagName == "input" || tagName == "select";
            string readOnlyAttribute = string.Empty;
            if (tagName == "input")
            {
                readOnlyAttribute = element.GetAttribute("readonly");
                if (readOnlyAttribute == null || readOnlyAttribute == "false")
                {
                    readOnlyAttribute = string.Empty;
                }
            }

            return element.Enabled && acceptableTagName && readOnlyAttribute == string.Empty;
        }
    }
}
