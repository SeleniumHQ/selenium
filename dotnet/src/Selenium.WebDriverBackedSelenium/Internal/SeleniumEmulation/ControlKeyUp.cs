using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the controlKeyUp keyword.
    /// </summary>
    internal class ControlKeyUp : SeleneseCommand
    {
        private KeyState keyState;

        public ControlKeyUp(KeyState keyState)
        {
            this.keyState = keyState;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            keyState.ControlKeyDown = false;
            return null;
        }
    }
}
