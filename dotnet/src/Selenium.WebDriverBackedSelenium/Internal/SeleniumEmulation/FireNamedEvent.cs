using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the fireEventNamed keyword.
    /// </summary>
    internal class FireNamedEvent : SeleneseCommand
    {
        private ElementFinder finder;
        private string fire;
        private string name;

        /// <summary>
        /// Initializes a new instance of the <see cref="FireNamedEvent"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        /// <param name="eventName">The name of the event to fire.</param>
        public FireNamedEvent(ElementFinder elementFinder, string eventName)
        {
            this.finder = elementFinder;
            this.name = eventName;
            this.fire = "return (" + JavaScriptLibrary.GetSeleniumScript("fireEvent.js") + ").apply(null, arguments);";
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
            JavaScriptLibrary.ExecuteScript(driver, this.fire, element, this.name);
            return null;
        }
    }
}
