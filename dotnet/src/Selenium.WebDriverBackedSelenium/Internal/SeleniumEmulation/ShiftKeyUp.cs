using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class ShiftKeyUp : SeleneseCommand
    {
        private KeyState keyState;

        public ShiftKeyUp(KeyState keyState)
        {
            this.keyState = keyState;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            keyState.ShiftKeyDown = true;
            return null;
        }
    }
}
