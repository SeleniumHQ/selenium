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
        // Regular expression for scripts that reference the current window.
        private static readonly Regex SeleniumWindowReferenceRegex = new Regex("selenium\\.(browserbot|page\\(\\))\\.getCurrentWindow\\(\\)");

        // Regular expression for scripts that reference the current window's document.
        private static readonly Regex SeleniumDocumentReferenceRegex = new Regex("selenium\\.(browserbot|page\\(\\))\\.getDocument\\(\\)");

        private Regex seleniumBaseUrlRegex = new Regex("selenium\\.browserbot\\.baseUrl");
        private string url;

        /// <summary>
        /// Initializes a new instance of the <see cref="GetEval"/> class.
        /// </summary>
        /// <param name="baseUrl">The <see cref="Uri"/> used to replace the base URL in the script being run.</param>
        public GetEval(Uri baseUrl)
        {
            this.url = '"' + baseUrl.ToString() + '"';
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
            string script = locator.Replace("\n", "\\\\n");
            script = SeleniumWindowReferenceRegex.Replace(script, "window");
            script = SeleniumDocumentReferenceRegex.Replace(script, "window.document");
            script = this.seleniumBaseUrlRegex.Replace(script, this.url);
            script = script.Replace("\"", "\\\"");
            script = script.Replace("'", "\\\\'");
            script = string.Format(CultureInfo.InvariantCulture, "return eval('{0}');", script);

            return ((IJavaScriptExecutor)driver).ExecuteScript(script);
        }
    }
}
