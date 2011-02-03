using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the keyEvent keyword.
    /// </summary>
    internal class KeyEvent : SeleneseCommand
    {
        private ElementFinder finder;
        private KeyState keyState;
        private string eventName;

        /// <summary>
        /// Initializes a new instance of the <see cref="KeyEvent"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        /// <param name="state">A <see cref="KeyState"/> object defining the state of modifier keys.</param>
        /// <param name="eventName">The name of the event to send.</param>
        public KeyEvent(ElementFinder elementFinder, KeyState state, string eventName)
        {
            this.finder = elementFinder;
            this.keyState = state;
            this.eventName = eventName;
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
            object[] parameters = new object[] 
            { 
                value, 
                this.keyState.ControlKeyDown, 
                this.keyState.AltKeyDown, 
                this.keyState.ShiftKeyDown, 
                this.keyState.MetaKeyDown 
            };

            JavaScriptLibrary.CallEmbeddedSelenium(driver, this.eventName, this.finder.FindElement(driver, locator), parameters);

            return null;
        }
    }
}
