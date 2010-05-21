using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetElementWidth : SeleneseCommand
    {
        private ElementFinder finder;

        public GetElementWidth(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            Size size = ((IRenderedWebElement)finder.FindElement(driver, locator)).Size;
            return size.Width;
        }
    }
}
