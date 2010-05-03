using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class ControlKeyDown : SeleneseCommand
    {
        private KeyState keyState;

        public ControlKeyDown(KeyState keyState)
        {
            this.keyState = keyState;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            keyState.ControlKeyDown = true;
            return null;
        }
    }
}
