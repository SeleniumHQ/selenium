using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class ShiftKeyDown : SeleneseCommand
    {
        private KeyState keyState;

        public ShiftKeyDown(KeyState keyState)
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
