// <copyright file="GetAttributeFromAllWindows.cs" company="WebDriver Committers">
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

using System.Collections.Generic;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the getAttributeFromAllWindows keyword.
    /// </summary>
    internal class GetAttributeFromAllWindows : SeleneseCommand
    {
        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            string current = driver.CurrentWindowHandle;

            List<string> attributes = new List<string>();
            foreach (string handle in driver.WindowHandles)
            {
                driver.SwitchTo().Window(handle);
                string attributeValue = (string)((IJavaScriptExecutor)driver).ExecuteScript("return '' + window[arguments[0]];", value);
                attributes.Add(attributeValue);
            }

            driver.SwitchTo().Window(current);

            return attributes.ToArray();
        }
    }
}
