using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using System.Collections.ObjectModel;

namespace Selenium.Internal.SeleniumEmulation
{
    class RemoveAllSelections : SeleneseCommand
    {
        private ElementFinder finder;

        public RemoveAllSelections(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement select = finder.FindElement(driver, locator);
            ReadOnlyCollection<IWebElement> options = select.FindElements(By.TagName("option"));

            string multiple = select.GetAttribute("multiple");
            if (string.IsNullOrEmpty(multiple))
            {
                return null;
            }

            foreach (IWebElement option in options)
            {
                if (option.Selected)
                {
                    option.Toggle();
                }
            }

            return null;
        }
    }
}
