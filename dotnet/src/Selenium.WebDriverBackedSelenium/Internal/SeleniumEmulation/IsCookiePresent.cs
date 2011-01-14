using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class IsCookiePresent : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string name, string ignored)
        {
            return driver.Manage().GetCookieNamed(name) == null ? false : true;
        }
    }
}
