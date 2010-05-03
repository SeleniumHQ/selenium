using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class Refresh : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string ignored, string alsoIgnored)
        {
            driver.Navigate().Refresh();
            return null;
        }
    }
}
