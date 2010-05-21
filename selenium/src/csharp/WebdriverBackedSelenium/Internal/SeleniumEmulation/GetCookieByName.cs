using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetCookieByName : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            Cookie cookie = driver.Manage().GetCookieNamed(locator);
            return cookie == null ? null : cookie.Value;
        }
    }
}
