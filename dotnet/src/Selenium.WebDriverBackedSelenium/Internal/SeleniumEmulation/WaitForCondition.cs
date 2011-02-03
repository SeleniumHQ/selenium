using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the waitForCondition keyword.
    /// </summary>
    internal class WaitForCondition : SeleneseCommand
    {
        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
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

        /// <summary>
        /// Provides methods to wait for a condition to be true.
        /// </summary>
        private class ConditionWaiter : Waiter
        {
            private IWebDriver driver;
            private string script;

            /// <summary>
            /// Initializes a new instance of the <see cref="ConditionWaiter"/> class.
            /// </summary>
            /// <param name="driver">The <see cref="IWebDriver"/> object to use to wait.</param>
            /// <param name="script">The JavaScript script to use defining the wait condition.</param>
            /// <remarks>The JavaScript script must return a boolean (true or false) value.</remarks>
            public ConditionWaiter(IWebDriver driver, string script)
                : base()
            {
                this.driver = driver;
                this.script = script;
            }

            /// <summary>
            /// The function called to wait for the condition
            /// </summary>
            /// <returns>Returns true when it's time to stop waiting.</returns>
            public override bool Until()
            {
                return (bool)((IJavaScriptExecutor)this.driver).ExecuteScript(this.script);
            }
        }
    }
}
