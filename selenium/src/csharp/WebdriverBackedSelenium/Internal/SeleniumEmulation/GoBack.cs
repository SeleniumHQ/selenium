using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GoBack : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string ignored, string alsoIgnored)
        {
            driver.Navigate().Back();
            return null;
        }
    }
}
