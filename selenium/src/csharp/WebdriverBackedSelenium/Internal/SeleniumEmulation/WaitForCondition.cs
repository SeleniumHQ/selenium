using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    class WaitForCondition : SeleneseCommand
    {
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            ConditionWaiter waiter = new ConditionWaiter(driver, locator);
            waiter.Wait("Failed to resolve " + locator, long.Parse(value));
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
