using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the addLocationStrategy keyword.
    /// </summary>
    internal class AddLocationStrategy : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="AddLocationStrategy"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> object used to locate elements.</param>
        public AddLocationStrategy(ElementFinder elementFinder)
        {
            finder = elementFinder;
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
            UserLookupStrategy strategy = new UserLookupStrategy(value);
            finder.AddStrategy(locator, strategy);

            return null;
        }
        
        /// <summary>
        /// Provides a mechanism for user-defined lookup strategies.
        /// </summary>
        private class UserLookupStrategy : ILookupStrategy
        {
            private string strategyFunctionDefinition = string.Empty;

            /// <summary>
            /// Initializes a new instance of the <see cref="UserLookupStrategy"/> class.
            /// </summary>
            /// <param name="functionDefinition">A JavaScript function that returns a web element.</param>
            public UserLookupStrategy(string functionDefinition)
            {
                strategyFunctionDefinition = functionDefinition;
            }

            #region ILookupStrategy Members
            /// <summary>
            /// Finds an element on the page based on a user-defined JavaScript function.
            /// </summary>
            /// <param name="driver">The <see cref="IWebDriver"/> object driving the browser.</param>
            /// <param name="use">The script to use to find the element.</param>
            /// <returns>An <see cref="IWebElement"/> that matches the criteria.</returns>
            public IWebElement Find(IWebDriver driver, string use)
            {
                string finderScript = string.Format(CultureInfo.InvariantCulture, @"(function(locator, inWindow, inDocument) {{ {0} }}).call(this,'{1}', window, document)", strategyFunctionDefinition, use);
                IJavaScriptExecutor scriptExecutor = driver as IJavaScriptExecutor;

                return scriptExecutor.ExecuteScript(finderScript, strategyFunctionDefinition, use) as IWebElement;
            }

            #endregion
        }
    }
}
