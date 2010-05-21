using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class DragAndDrop : SeleneseCommand
    {
        private ElementFinder finder;

        public DragAndDrop(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string[] parts = value.Split(new string[] { "," }, 2, StringSplitOptions.None);
            int deltaX = int.Parse(parts[0], CultureInfo.InvariantCulture);
            int deltaY = int.Parse(parts[1], CultureInfo.InvariantCulture);

            ((IRenderedWebElement)finder.FindElement(driver, locator)).DragAndDropBy(deltaX, deltaY);

            return null;
        }
    }
}
