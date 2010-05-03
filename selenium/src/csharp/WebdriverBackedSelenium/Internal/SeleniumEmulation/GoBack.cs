using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    class GoBack : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string ignored, string alsoIgnored)
        {
            driver.Navigate().Back();
            return null;
        }
    }
}
