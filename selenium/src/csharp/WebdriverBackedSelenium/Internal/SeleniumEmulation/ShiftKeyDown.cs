using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class ShiftKeyDown : SeleneseCommand
    {
        private KeyState keyState;

        public ShiftKeyDown(KeyState keyState)
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
