// <copyright file="AddLocationStrategy.cs" company="WebDriver Committers">
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
            string strategy = string.Format(CultureInfo.InvariantCulture, @"return (function(locator, inWindow, inDocument) {{ {0} }}).call(null, arguments[0], window, document)", value);

            this.finder.AddStrategy(locator, strategy);

            return null;
        }
    }
}
