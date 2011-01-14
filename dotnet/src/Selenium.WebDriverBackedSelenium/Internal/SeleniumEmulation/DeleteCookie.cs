using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class DeleteCookie : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string name, string ignored)
        {
            driver.Manage().DeleteCookieNamed(name);
            return null;
        }
    }
}
