using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using OpenQA.Selenium;
using OpenQA.Selenium.Internal;

namespace Selenium.Internal.SeleniumEmulation
{
    internal static class JavaScriptLibrary
    {
        private const string InjectableSeleniumResourceName = "injectableSelenium.js";
        private const string HtmlUtilsResourceName = "htmlutils.js";

        public static void CallEmbeddedSelenium(IWebDriver driver, string functionName, IWebElement element, params object[] values)
        {
            StringBuilder builder = new StringBuilder(ReadScript(InjectableSeleniumResourceName));
            builder.Append("return browserbot.").Append(functionName).Append(".apply(browserbot, arguments);");

            List<object> args = new List<object>();
            args.Add(element);
            args.AddRange(values);

            ((IJavaScriptExecutor)driver).ExecuteScript(builder.ToString(), args.ToArray());
        }

        public static object CallEmbeddedHtmlUtils(IWebDriver driver, string functionName, IWebElement element, params object[] values)
        {
            StringBuilder builder = new StringBuilder(ReadScript(HtmlUtilsResourceName));

            builder.Append("return htmlutils.").Append(functionName).Append(".apply(htmlutils, arguments);");

            List<object> args = new List<object>();
            args.Add(element);
            args.AddRange(values);

            return ((IJavaScriptExecutor)driver).ExecuteScript(builder.ToString(), args.ToArray());
        }

        public static object ExecuteScript(IWebDriver driver, string script, params object[] args)
        {
            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;
            if (executor == null)
            {
                throw new InvalidOperationException("The underlying WebDriver instance does not support executing javascript");
            }
            else
            {
                return executor.ExecuteScript(script, args);
            }
        }

        private static string ReadScript(string script)
        {
            string extractedScript = string.Empty;
            Stream resourceStream = ResourceUtilities.GetResourceStream(script, script);
            using (TextReader reader = new StreamReader(resourceStream))
            {
                extractedScript = reader.ReadToEnd();
            }

            return extractedScript;
        }
    }
}
