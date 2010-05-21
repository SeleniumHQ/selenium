using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal abstract class SeleneseCommand
    {
        internal object Apply(IWebDriver driver, string[] args)
        {
            switch (args.Length)
            {
                case 0:
                    return HandleSeleneseCommand(driver, null, null);

                case 1:
                    return HandleSeleneseCommand(driver, args[0], null);

                case 2:
                    return HandleSeleneseCommand(driver, args[0], args[1]);

                default:
                    throw new SeleniumException("Too many arguments! " + args.Length);
            }
        }

        protected abstract object HandleSeleneseCommand(IWebDriver driver, string locator, string value);
    }
}
