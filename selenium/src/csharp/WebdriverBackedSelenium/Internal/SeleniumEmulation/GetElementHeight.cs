using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetElementHeight : SeleneseCommand
    {
        private ElementFinder finder;

        public GetElementHeight(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            Size size = ((IRenderedWebElement)finder.FindElement(driver, locator)).Size;
            return size.Height;
        }
    }
}
