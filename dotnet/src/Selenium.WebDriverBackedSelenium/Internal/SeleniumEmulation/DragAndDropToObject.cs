using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the dragAndDropToObject keyword.
    /// </summary>
    internal class DragAndDropToObject : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="DragAndDropToObject"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public DragAndDropToObject(ElementFinder elementFinder)
        {
            this.finder = elementFinder;
        }

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IRenderedWebElement dragger = (IRenderedWebElement)this.finder.FindElement(driver, locator);
            IRenderedWebElement draggee = (IRenderedWebElement)this.finder.FindElement(driver, value);

            dragger.DragAndDropOn(draggee);

            return null;
        }
    }
}
