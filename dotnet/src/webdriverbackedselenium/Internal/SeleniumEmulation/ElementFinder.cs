// <copyright file="ElementFinder.cs" company="WebDriver Committers">
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
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides methods for finding elements.
    /// </summary>
    internal class ElementFinder
    {
        private string findElement;
        private Dictionary<string, string> lookupStrategies = new Dictionary<string, string>();

        /// <summary>
        /// Initializes a new instance of the <see cref="ElementFinder"/> class.
        /// </summary>
        public ElementFinder()
        {
            string rawScript = JavaScriptLibrary.GetSeleniumScript("findElement.js");
            this.findElement = "return (" + rawScript + ")(arguments[0]);";

            string linkTextLocator = "return (" + JavaScriptLibrary.GetSeleniumScript("linkLocator.js") + ").call(null, arguments[0], document)";

            this.AddStrategy("link", linkTextLocator);
        }

        /// <summary>
        /// Finds an element.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> to use in finding the elements.</param>
        /// <param name="locator">The locator string describing how to find the element.</param>
        /// <returns>An <see cref="IWebElement"/> described by the locator.</returns>
        /// <exception cref="SeleniumException">There is no element matching the locator.</exception>
        internal IWebElement FindElement(IWebDriver driver, string locator)
        {
            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;
            IWebElement result;
            string strategy = this.FindStrategy(locator);
            if (!string.IsNullOrEmpty(strategy))
            {
                string actualLocator = locator.Substring(locator.IndexOf('=') + 1);

                // TODO(simon): Recurse into child documents
                try
                {
                    result = executor.ExecuteScript(strategy, actualLocator) as IWebElement;

                    if (result == null)
                    {
                        throw new SeleniumException("Element " + locator + " not found");
                    }

                    return result;
                }
                catch (WebDriverException)
                {
                    throw new SeleniumException("Element " + locator + " not found");
                }
            }

            try
            {
                result = FindElementDirectly(driver, locator);
                if (result != null)
                {
                    return result;
                }

                return executor.ExecuteScript(this.findElement, locator) as IWebElement;
            }
            catch (WebDriverException)
            {
                throw new SeleniumException("Element " + locator + " not found");
            }
            catch (InvalidOperationException)
            {
                throw new SeleniumException("Element " + locator + " not found");
            }
        }

        /// <summary>
        /// Gets the strategy used to find elements.
        /// </summary>
        /// <param name="locator">The locator string that defines the strategy.</param>
        /// <returns>A string used in finding elements.</returns>
        internal string FindStrategy(string locator)
        {
            string strategy = string.Empty;
            int index = locator.IndexOf('=');
            if (index == -1)
            {
                return null;
            }

            string strategyName = locator.Substring(0, index);
            if (!this.lookupStrategies.TryGetValue(strategyName, out strategy))
            {
                return null;
            }

            return strategy;
        }

        /// <summary>
        /// Adds a strategy to the dictionary of known lookup strategies.
        /// </summary>
        /// <param name="strategyName">The name used to identify the lookup strategy.</param>
        /// <param name="strategy">The string used in finding elements.</param>
        internal void AddStrategy(string strategyName, string strategy)
        {
            this.lookupStrategies.Add(strategyName, strategy);
        }

        private static IWebElement FindElementDirectly(IWebDriver driver, string locator)
        {
            if (locator.StartsWith("xpath=", StringComparison.Ordinal))
            {
                return FindUsingXPath(driver, locator.Substring("xpath=".Length));
            }

            if (locator.StartsWith("//", StringComparison.Ordinal))
            {
                return FindUsingXPath(driver, locator);
            }

            if (locator.StartsWith("css=", StringComparison.Ordinal))
            {
                return driver.FindElement(By.CssSelector(locator.Substring("css=".Length)));
            }

            return null;
        }

        private static IWebElement FindUsingXPath(IWebDriver driver, string xpath)
        {
            try
            {
                return driver.FindElement(By.XPath(xpath));
            }
            catch (WebDriverException)
            {
                if (xpath.EndsWith("/"))
                {
                    xpath = xpath.Substring(0, xpath.Length - 1);
                    return driver.FindElement(By.XPath(xpath));
                }
            }

            throw new NoSuchElementException(string.Format(CultureInfo.InvariantCulture, "Cannot find element by XPath {0}", xpath));
        }
    }
}
