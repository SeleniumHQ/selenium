using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the setTimeout keyword.
    /// </summary>
    internal class SetTimeout : SeleneseCommand
    {
        private CommandTimer timer;
        public SetTimeout(CommandTimer timer)
        {
            this.timer = timer;
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string timeout, string ignored)
        {
            if (timeout == "0")
            {
                timer.Timeout = int.MaxValue;
            }
            else
            {
                timer.Timeout = int.Parse(timeout);
            }

            return null;
        }
    }
}
