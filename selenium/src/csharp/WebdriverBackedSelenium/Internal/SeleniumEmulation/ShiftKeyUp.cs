using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class ShiftKeyUp : SeleneseCommand
    {
        private KeyState keyState;

        public ShiftKeyUp(KeyState keyState)
        {
            this.keyState = keyState;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            keyState.ShiftKeyDown = true;
            return null;
        }
    }
}
