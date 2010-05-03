using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class MetaKeyDown : SeleneseCommand
    {
        private KeyState keyState;

        public MetaKeyDown(KeyState keyState)
        {
            this.keyState = keyState;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            keyState.MetaKeyDown = true;
            return null;
        }
    }
}
