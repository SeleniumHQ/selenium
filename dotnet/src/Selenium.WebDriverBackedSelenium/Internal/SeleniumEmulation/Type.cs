using System;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class Type : SeleneseCommand
    {
        private ElementFinder finder;
        private KeyState state;

        public Type(ElementFinder elementFinder, KeyState keyState)
        {
            this.finder = elementFinder;
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
                JavaScriptLibrary.CallEmbeddedSelenium(driver, "replaceText", element, stringToType);
            }
            else
            {
                element.SendKeys(stringToType);
            }

            return null;
        }
    }
}
