using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;

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
            IWebElement dragElement = this.finder.FindElement(driver, locator);
            IWebElement dropElement = this.finder.FindElement(driver, value);
            Actions actionBuilder = new Actions(driver);
            actionBuilder.DragAndDrop(dragElement, dropElement).Perform();

            return null;
        }
    }
}
