using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class MetaKeyDown : SeleneseCommand
    {
        private KeyState keyState;

        public MetaKeyDown(KeyState keyState)
        {
            this.keyState = keyState;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            keyState.MetaKeyDown = true;
            return null;
        }
    }
}
