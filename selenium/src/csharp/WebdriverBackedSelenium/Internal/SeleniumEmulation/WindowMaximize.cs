using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class WindowMaximize : SeleneseCommand
    {
        private JavaScriptLibrary library;

        public WindowMaximize(JavaScriptLibrary js)
        {
            library = js;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            library.ExecuteScript(driver, "if (window.screen) { window.moveTo(0, 0); window.resizeTo(window.screen.availWidth, window.screen.availHeight);};");
            return null;
        }
    }
}
