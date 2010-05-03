using System;
using System.Collections.Generic;
using System.Text;
using Selenium;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    public abstract class SeleneseCommand
    {
        public object Apply(IWebDriver driver, String[] args)
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

        protected abstract object HandleSeleneseCommand(IWebDriver driver, String locator, String value);
    }
}
