using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the deleteAllVisibleCookies keyword.
    /// </summary>
    internal class DeleteAllVisibleCookies : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string ignored, string alsoIgnored)
        {
            driver.Manage().DeleteAllCookies();
            return null;
        }
    }
}
