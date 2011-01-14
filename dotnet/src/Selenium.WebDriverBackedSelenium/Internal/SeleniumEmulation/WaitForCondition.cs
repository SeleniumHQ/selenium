using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class WaitForCondition : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string waitMessage = "Failed to resolve " + locator;
            ConditionWaiter waiter = new ConditionWaiter(driver, locator);
            if (!string.IsNullOrEmpty(value))
            {
                waiter.Wait(waitMessage, long.Parse(value, CultureInfo.InvariantCulture));
            }
            else
            {
                waiter.Wait(waitMessage);
            }

            return null;
        }

        private class ConditionWaiter : Waiter
        {
            private IWebDriver driver;
            private string script;

            public ConditionWaiter(IWebDriver driver, string script)
                : base()
            {
                this.driver = driver;
                this.script = script;
            }

            public override bool Until()
            {
                return (bool)((IJavaScriptExecutor)driver).ExecuteScript(script);
            }
        }
    }
}
