using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the close keyword.
    /// </summary>
    internal class Close : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            driver.Close();
            return null;
        }
    }
}
