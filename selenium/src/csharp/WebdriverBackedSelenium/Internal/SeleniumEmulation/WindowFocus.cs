using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class WindowFocus : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            JavaScriptLibrary.ExecuteScript(driver, "window.focus()");
            return null;
        }
    }
}
