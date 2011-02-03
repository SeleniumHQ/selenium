using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the altKeyUp keyword.
    /// </summary>
    internal class AltKeyUp : SeleneseCommand
    {
        private KeyState keyState;

        /// <summary>
        /// Initializes a new instance of the <see cref="AltKeyUp"/> class.
        /// </summary>
        /// <param name="keyState">A <see cref="KeyState"/> object tracking the state of modifier keys.</param>
        public AltKeyUp(KeyState keyState)
        {
            this.keyState = keyState;
        }

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            this.keyState.AltKeyDown = false;
            return null;
        }
    }
}
