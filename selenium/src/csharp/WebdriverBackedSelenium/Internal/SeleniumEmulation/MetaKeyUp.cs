using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class MetaKeyUp : SeleneseCommand
    {
        private KeyState keyState;

        public MetaKeyUp(KeyState keyState)
        {
            this.keyState = keyState;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            keyState.MetaKeyDown = false;
            return null;
        }
    }
}
