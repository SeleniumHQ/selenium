// <copyright file="OpenWindow.cs" company="WebDriver Committers">
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
    /// Defines the command for the openWindow keyword.
    /// </summary>
    internal class OpenWindow : SeleneseCommand
    {
        private GetEval opener;

        /// <summary>
        /// Initializes a new instance of the <see cref="OpenWindow"/> class.
        /// </summary>
        /// <param name="windowOpener">A <see cref="GetEval"/> object that opens the window.</param>
        public OpenWindow(GetEval windowOpener)
        {
            this.opener = windowOpener;
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
            string[] args = { string.Format(CultureInfo.InvariantCulture, "window.open('{0}', '{1}'); null;", locator, value) };

            this.opener.Apply(driver, args);

            return null;
        }
    }
}
