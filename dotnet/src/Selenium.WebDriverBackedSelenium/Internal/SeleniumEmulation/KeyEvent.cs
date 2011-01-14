using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class KeyEvent : SeleneseCommand
    {
        private ElementFinder finder;
        private KeyState keyState;
        private string eventName;

        public KeyEvent(ElementFinder elementFinder, KeyState state, string eventName)
        {
            this.finder = elementFinder;
            this.keyState = state;
            this.eventName = eventName;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            object[] parameters = new object[] 
            { 
                value, 
                keyState.ControlKeyDown, 
                keyState.AltKeyDown, 
                keyState.ShiftKeyDown, 
                keyState.MetaKeyDown 
            };

            JavaScriptLibrary.CallEmbeddedSelenium(driver, eventName, finder.FindElement(driver, locator), parameters);

            return null;
        }
    }
}
