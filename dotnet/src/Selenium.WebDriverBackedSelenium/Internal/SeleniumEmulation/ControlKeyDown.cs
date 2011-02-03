using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the controlKeyDown keyword.
    /// </summary>
    internal class ControlKeyDown : SeleneseCommand
    {
        private KeyState keyState;

        /// <summary>
        /// Initializes a new instance of the <see cref="ControlKeyDown"/> class.
        /// </summary>
        /// <param name="keyState">A <see cref="KeyState"/> object tracking the state of modifier keys.</param>
        public ControlKeyDown(KeyState keyState)
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
            this.keyState.ControlKeyDown = true;
            return null;
        }
    }
}
