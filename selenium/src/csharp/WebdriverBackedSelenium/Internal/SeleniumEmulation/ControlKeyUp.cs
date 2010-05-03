using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class ControlKeyUp : SeleneseCommand
    {
        private KeyState keyState;

        public ControlKeyUp(KeyState keyState)
        {
            this.keyState = keyState;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            keyState.ControlKeyDown = false;
            return null;
        }
    }
}
