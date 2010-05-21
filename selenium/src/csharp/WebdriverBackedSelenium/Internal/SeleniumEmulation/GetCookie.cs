using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetCookie : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            StringBuilder builder = new StringBuilder();
            foreach (Cookie c in driver.Manage().GetCookies())
            {
                builder.Append(c.ToString());
                builder.Append("; ");
            }
            
            return builder.ToString();
        }
    }
}
