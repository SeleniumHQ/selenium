// <copyright file="JavaScriptLibrary.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using OpenQA.Selenium;
using OpenQA.Selenium.Internal;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides the internal JavaScript library.
    /// </summary>
    public static class JavaScriptLibrary
    {
        private const string InjectableSeleniumResourceName = "injectableSelenium.js";
        private const string HtmlUtilsResourceName = "htmlutils.js";

        /// <summary>
        /// Calls the embedded selenium library in a web page.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> object used to call the script.</param>
        /// <param name="functionName">The function name to call.</param>
        /// <param name="element">An <see cref="IWebElement"/> used as an argument to the JavaScript function.</param>
        /// <param name="values">An array of values containing additional arguments to the function.</param>
        public static void CallEmbeddedSelenium(IWebDriver driver, string functionName, IWebElement element, params object[] values)
        {
            StringBuilder builder = new StringBuilder(ReadScript(InjectableSeleniumResourceName));
            builder.Append("return browserbot.").Append(functionName).Append(".apply(browserbot, arguments);");

            List<object> args = new List<object>();
            args.Add(element);
            args.AddRange(values);

            ((IJavaScriptExecutor)driver).ExecuteScript(builder.ToString(), args.ToArray());
        }

        /// <summary>
        /// Calls the embedded HTML utilities library in a web page.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> object used to call the script.</param>
        /// <param name="functionName">The function name to call.</param>
        /// <param name="element">An <see cref="IWebElement"/> used as an argument to the JavaScript function.</param>
        /// <param name="values">An array of values containing additional arguments to the function.</param>
        /// <returns>The result of the script</returns>
        public static object CallEmbeddedHtmlUtilities(IWebDriver driver, string functionName, IWebElement element, params object[] values)
        {
            StringBuilder builder = new StringBuilder(ReadScript(HtmlUtilsResourceName));

            builder.Append("return htmlutils.").Append(functionName).Append(".apply(htmlutils, arguments);");

            List<object> args = new List<object>();
            args.Add(element);
            args.AddRange(values);

            return ((IJavaScriptExecutor)driver).ExecuteScript(builder.ToString(), args.ToArray());
        }

        /// <summary>
        /// Executes a script in a web page.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> object used to call the script.</param>
        /// <param name="script">The script to run.</param>
        /// <param name="args">An array of values containing additional arguments to the function.</param>
        /// <returns>The result of the script</returns>
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

        /// <summary>
        /// Loads the named Selenium script and returns it wrapped in an anonymous function.
        /// </summary>
        /// <param name="libraryName">The script to load.</param>
        /// <returns>The loaded script wrapped in an anonymous function.</returns>
        public static string GetSeleniumScript(string libraryName)
        {
            string rawFunction = ReadScript(libraryName);
            return string.Format(CultureInfo.InvariantCulture, @"function() {{ return ({0}).apply(null, arguments);}}", rawFunction);
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
