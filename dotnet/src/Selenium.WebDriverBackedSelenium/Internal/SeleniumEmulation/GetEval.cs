using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the getEval keyword.
    /// </summary>
    internal class GetEval : SeleneseCommand
    {
        private IScriptMutator mutator;

        /// <summary>
        /// Initializes a new instance of the <see cref="GetEval"/> class.
        /// </summary>
        /// <param name="mutator">The <see cref="IScriptMutator"/> used to replace terms in the script being run.</param>
        public GetEval(IScriptMutator mutator)
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
            StringBuilder scriptBuilder = new StringBuilder();
            this.mutator.Mutate(locator, scriptBuilder);
            object result = ((IJavaScriptExecutor)driver).ExecuteScript(scriptBuilder.ToString());
            return result == null ? string.Empty : result.ToString();
        }
    }
}
