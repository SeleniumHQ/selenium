using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class GetEval : SeleneseCommand
    {
        // Regular expression for scripts that reference the current window.
        private static readonly Regex SeleniumWindowReferenceRegex = new Regex("selenium\\.(browserbot|page\\(\\))\\.getCurrentWindow\\(\\)");

        // Regular expression for scripts that reference the current window's document.
        private static readonly Regex SeleniumDocumentReferenceRegex = new Regex("selenium\\.(browserbot|page\\(\\))\\.getDocument\\(\\)");

        private Regex seleniumBaseUrlRegex = new Regex("selenium\\.browserbot\\.baseUrl");
        private string url;

        public GetEval(Uri baseUrl)
        {
            this.url = '"' + baseUrl.ToString() + '"';
        }

        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string script = locator.Replace("\n", "\\\\n");
            script = SeleniumWindowReferenceRegex.Replace(script, "window");
            script = SeleniumDocumentReferenceRegex.Replace(script, "window.document");
            script = seleniumBaseUrlRegex.Replace(script, url);
            script = script.Replace("\"", "\\\"");
            script = script.Replace("'", "\\\\'");
            script = string.Format(CultureInfo.InvariantCulture, "return eval('{0}');", script);

            return ((IJavaScriptExecutor)driver).ExecuteScript(script);
        }
    }
}
