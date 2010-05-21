using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class IsEditable : SeleneseCommand
    {
        private ElementFinder finder;

        public IsEditable(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement element = finder.FindElement(driver, locator);
            string tagName = element.TagName.ToUpperInvariant();
            bool acceptableTagName = tagName == "INPUT" || tagName == "SELECT";
            string readOnlyAttribute = string.Empty;
            if (tagName == "INPUT")
            {
                readOnlyAttribute = element.GetAttribute("readonly");
                if (readOnlyAttribute != null && readOnlyAttribute == "false")
                {
                    readOnlyAttribute = string.Empty;
                }
            }

            return element.Enabled && acceptableTagName && string.IsNullOrEmpty(readOnlyAttribute);
        }
    }
}
