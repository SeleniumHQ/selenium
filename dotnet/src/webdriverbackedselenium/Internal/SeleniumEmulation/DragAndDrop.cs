// <copyright file="DragAndDrop.cs" company="WebDriver Committers">
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
using System.Globalization;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the dragAndDrop keyword.
    /// </summary>
    internal class DragAndDrop : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="DragAndDrop"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public DragAndDrop(ElementFinder elementFinder)
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
            string[] parts = value.Split(new string[] { "," }, 2, StringSplitOptions.None);
            int deltaX = int.Parse(parts[0], CultureInfo.InvariantCulture);
            int deltaY = int.Parse(parts[1], CultureInfo.InvariantCulture);

            IWebElement element = this.finder.FindElement(driver, locator);
            Actions actionBuilder = new Actions(driver);
            actionBuilder.DragAndDropToOffset(element, deltaX, deltaY).Perform();

            return null;
        }
    }
}
