// <copyright file="IsOrdered.cs" company="WebDriver Committers">
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

using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the isOrdered keyword.
    /// </summary>
    internal class IsOrdered : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="IsOrdered"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public IsOrdered(ElementFinder elementFinder)
        {
            this.finder = elementFinder;
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
            IWebElement one = this.finder.FindElement(driver, locator);
            IWebElement two = this.finder.FindElement(driver, value);

            string ordered =
              "    if (arguments[0] === arguments[1]) return false;\n" +
              "\n" +
              "    var previousSibling;\n" +
              "    while ((previousSibling = arguments[1].previousSibling) != null) {\n" +
              "        if (previousSibling === arguments[0]) {\n" +
              "            return true;\n" +
              "        }\n" +
              "        arguments[1] = previousSibling;\n" +
              "    }\n" +
              "    return false;\n";

            bool? result = (bool)JavaScriptLibrary.ExecuteScript(driver, ordered, one, two);
            return result != null && result.Value;
        }
    }
}
