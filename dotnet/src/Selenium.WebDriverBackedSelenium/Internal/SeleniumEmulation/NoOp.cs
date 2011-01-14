using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class NoOp : SeleneseCommand
    {
        private object returnValue;

        public NoOp(object toReturn)
        {
            returnValue = toReturn;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string ignored, string alsoIgnored)
        {
            return returnValue;
        }
    }
}
