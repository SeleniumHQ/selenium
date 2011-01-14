using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetElementPositionLeft : SeleneseCommand
    {
        private ElementFinder finder;

        public GetElementPositionLeft(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            Point location = ((IRenderedWebElement)finder.FindElement(driver, locator)).Location;
            return location.X;
        }
    }
}
