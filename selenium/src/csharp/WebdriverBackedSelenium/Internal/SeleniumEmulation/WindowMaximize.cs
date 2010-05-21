using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class WindowMaximize : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            JavaScriptLibrary.ExecuteScript(driver, "if (window.screen) { window.moveTo(0, 0); window.resizeTo(window.screen.availWidth, window.screen.availHeight);};");
            return null;
        }
    }
}
