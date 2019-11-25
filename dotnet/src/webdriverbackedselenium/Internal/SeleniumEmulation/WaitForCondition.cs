// <copyright file="WaitForCondition.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

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
        private IScriptMutator mutator;

        /// <summary>
        /// Initializes a new instance of the <see cref="WaitForCondition"/> class.
        /// </summary>
        /// <param name="mutator">An <see cref="IScriptMutator"/> used to modify the script 
        /// into something WebDriver can parse.</param>
        public WaitForCondition(IScriptMutator mutator)
        {
            this.mutator = mutator;
        }

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            StringBuilder builder = new StringBuilder();
            this.mutator.Mutate(locator, builder);
            string modified = builder.ToString();
            string waitMessage = "Failed to resolve " + locator;
            ConditionWaiter waiter = new ConditionWaiter(driver, modified);
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
                object result = ((IJavaScriptExecutor)this.driver).ExecuteScript(this.script);

                // Although the conditions should return a boolean, JS has a loose
                // definition of "true" Try and meet that definition.
                if (result == null)
                {
                    return false;
                }
                else if (result is string)
                {
                    return !string.IsNullOrEmpty(result.ToString());
                }
                else if (result is bool)
                {
                    return (bool)result;
                }
                else
                {
                    return true;
                }
            }
        }
    }
}
