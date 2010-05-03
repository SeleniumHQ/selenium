using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class DeleteAllVisibleCookies : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string ignored, string alsoIgnored)
        {
            driver.Manage().DeleteAllCookies();
            return null;
        }
    }
}
