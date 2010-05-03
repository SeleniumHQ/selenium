using System;
using System.Collections.Generic;
using System.Text;
using System.Globalization;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class DragAndDrop : SeleneseCommand
    {
        private ElementFinder finder;

        public DragAndDrop(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string[] parts = value.Split(new string[] {","}, 2, StringSplitOptions.None);
            int xDelta = int.Parse(parts[0], CultureInfo.InvariantCulture);
            int yDelta = int.Parse(parts[1], CultureInfo.InvariantCulture);

            ((IRenderedWebElement)finder.FindElement(driver, locator)).DragAndDropBy(xDelta, yDelta);

            return null;
        }
    }
}
