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

        public AltKeyUp(KeyState keyState)
        {
            this.keyState = keyState;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            keyState.AltKeyDown = false;
            return null;
        }
    }
}
