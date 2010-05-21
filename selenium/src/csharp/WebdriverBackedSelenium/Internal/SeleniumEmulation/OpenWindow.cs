using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class OpenWindow : SeleneseCommand
    {
        private GetEval opener;

        public OpenWindow(GetEval windowOpener)
        {
            opener = windowOpener;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string[] args = { string.Format(CultureInfo.InvariantCulture, "window.open('{0}', '{1}');", locator, value) };

            opener.Apply(driver, args);

            return null;
        }
    }
}
