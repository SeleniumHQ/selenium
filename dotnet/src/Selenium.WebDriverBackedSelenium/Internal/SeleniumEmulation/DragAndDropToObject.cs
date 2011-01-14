using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class DragAndDropToObject : SeleneseCommand
    {
        private ElementFinder finder;

        public DragAndDropToObject(ElementFinder elementFinder)
        {
            finder = elementFinder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IRenderedWebElement dragger = (IRenderedWebElement)finder.FindElement(driver, locator);
            IRenderedWebElement draggee = (IRenderedWebElement)finder.FindElement(driver, value);

            dragger.DragAndDropOn(draggee);

            return null;
        }
    }
}
