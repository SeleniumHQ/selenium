using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the mouseEvent keyword.
    /// </summary>
    internal class MouseEvent : SeleneseCommand
    {
        private ElementFinder finder;
        private string type;

        /// <summary>
        /// Initializes a new instance of the <see cref="MouseEvent"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        /// <param name="eventType">Type of event to trigger.</param>
        public MouseEvent(ElementFinder elementFinder, string eventType)
        {
            this.finder = elementFinder;
            this.type = eventType;
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
            IWebElement element = this.finder.FindElement(driver, locator);
            JavaScriptLibrary.CallEmbeddedSelenium(driver, "triggerMouseEvent", element, this.type, true);
            return null;
        }
    }
}
