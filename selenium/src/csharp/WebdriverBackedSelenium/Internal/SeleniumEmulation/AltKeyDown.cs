using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the altKeyDown keyword.
    /// </summary>
    internal class AltKeyDown : SeleneseCommand
    {
        private KeyState keyState;

        public AltKeyDown(KeyState keyState)
        {
            this.keyState = keyState;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            keyState.AltKeyDown = true;
            return null;
        }
    }
}
