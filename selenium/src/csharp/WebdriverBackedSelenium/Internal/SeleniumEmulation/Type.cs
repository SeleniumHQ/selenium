using OpenQA.Selenium;
using System;

namespace Selenium.Internal.SeleniumEmulation
{
    class Type : SeleneseCommand
    {
        private ElementFinder finder;
        private JavaScriptLibrary library;
        private KeyState state;

        public Type(JavaScriptLibrary js, ElementFinder elementFinder, KeyState keyState)
        {
            this.finder = elementFinder;
            this.library = js;
            this.state = keyState;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            if (state.ControlKeyDown || state.AltKeyDown || state.MetaKeyDown)
            {
                throw new SeleniumException("type not supported immediately after call to controlKeyDown() or altKeyDown() or metaKeyDown()");
            }

            string stringToType = state.ShiftKeyDown ? value.ToUpperInvariant() : value;

            IWebElement element = finder.FindElement(driver, locator);
            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;
            if (executor != null && executor.IsJavaScriptEnabled)
            {
                library.CallEmbeddedSelenium(driver, "replaceText", element, stringToType);
            }
            else
            {
                element.SendKeys(stringToType);
            }
            return null;
        }
    }
}
