using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the assignId keyword.
    /// </summary>
    internal class AssignId : SeleneseCommand
    {
        private ElementFinder finder;

        public AssignId(ElementFinder finder)
        {
            this.finder = finder;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            JavaScriptLibrary.ExecuteScript(driver, "arguments[0].id = arguments[1]", finder.FindElement(driver, locator), value);
            return null;
        }
    }
}
