using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class KeyEvent : SeleneseCommand
    {
        private ElementFinder finder;
        private JavaScriptLibrary library;
        private KeyState keyState;
        private string eventName;

        public KeyEvent(ElementFinder elementFinder, JavaScriptLibrary js, KeyState state, String eventName)
        {
            this.finder = elementFinder;
            this.library = js;
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
            library.CallEmbeddedSelenium(driver, eventName, finder.FindElement(driver, locator), parameters);

            return null;
        }
    }
}
