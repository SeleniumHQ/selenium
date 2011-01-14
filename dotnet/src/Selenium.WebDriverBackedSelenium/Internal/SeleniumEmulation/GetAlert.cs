using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the addSelection keyword.
    /// </summary>
    internal class GetAlert : SeleneseCommand
    {
        private AlertOverride alertOverride;

        public GetAlert(AlertOverride alertOverride)
        {
            this.alertOverride = alertOverride;
        }

        protected override object HandleSeleneseCommand(OpenQA.Selenium.IWebDriver driver, string locator, string value)
        {
            return alertOverride.GetNextAlert(driver);
        }
    }
}
