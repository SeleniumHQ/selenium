using System;
using System.Collections.Generic;
using System.Drawing;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetElementPositionTop : SeleneseCommand
    {
        private ElementFinder finder;

        public GetElementPositionTop(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            Point location = ((IRenderedWebElement)finder.FindElement(driver, locator)).Location;
            return location.Y;
        }
    }
}
