using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class AssignId : SeleneseCommand
    {
      private JavaScriptLibrary js;
      private ElementFinder finder;

      public AssignId(JavaScriptLibrary js, ElementFinder finder) {
        this.js = js;
        this.finder = finder;
      }
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            js.ExecuteScript(driver, "arguments[0].id = arguments[1]", finder.FindElement(driver, locator), value);
            return null;
        }
    }
}
