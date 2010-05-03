using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class WindowFocus : SeleneseCommand
    {
        private JavaScriptLibrary library;

        public WindowFocus(JavaScriptLibrary js)
        {
            library = js;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            library.ExecuteScript(driver, "window.focus()");
            return null;
        }
    }
}
