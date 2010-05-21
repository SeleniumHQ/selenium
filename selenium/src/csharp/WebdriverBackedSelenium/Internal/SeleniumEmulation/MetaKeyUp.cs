using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class MetaKeyUp : SeleneseCommand
    {
        private KeyState keyState;

        public MetaKeyUp(KeyState keyState)
        {
            this.keyState = keyState;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            keyState.MetaKeyDown = false;
            return null;
        }
    }
}
