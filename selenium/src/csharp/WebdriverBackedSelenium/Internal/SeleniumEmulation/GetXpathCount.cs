using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetXpathCount : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            return driver.FindElements(By.XPath(locator)).Count;
        }
    }
}
