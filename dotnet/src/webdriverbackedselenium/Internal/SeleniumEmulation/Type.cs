// <copyright file="Type.cs" company="WebDriver Committers">
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
    /// Defines the command for the type keyword.
    /// </summary>
    internal class Type : SeleneseCommand
    {
        private AlertOverride alertOverride;
        private ElementFinder finder;
        private KeyState state;
        private string type;

        /// <summary>
        /// Initializes a new instance of the <see cref="Type"/> class.
        /// </summary>
        /// <param name="alertOverride">An <see cref="AlertOverride"/> object used to handle JavaScript alerts.</param>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        /// <param name="keyState">A <see cref="KeyState"/> object tracking the state of modifier keys.</param>
        public Type(AlertOverride alertOverride, ElementFinder elementFinder, KeyState keyState)
        {
            this.alertOverride = alertOverride;
            this.finder = elementFinder;
            this.state = keyState;
            this.type = "return (" + JavaScriptLibrary.GetSeleniumScript("type.js") + ").apply(null, arguments);";
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
            this.alertOverride.ReplaceAlertMethod();
            if (this.state.ControlKeyDown || this.state.AltKeyDown || this.state.MetaKeyDown)
            {
                throw new SeleniumException("type not supported immediately after call to controlKeyDown() or altKeyDown() or metaKeyDown()");
            }

            string stringToType = this.state.ShiftKeyDown ? value.ToUpperInvariant() : value;

            IWebElement element = this.finder.FindElement(driver, locator);

            // TODO(simon): Log a warning that people should be using "attachFile"
            string tagName = element.TagName;
            string elementType = element.GetAttribute("type");
            if (tagName.ToLowerInvariant() == "input" && elementType != null && elementType.ToLowerInvariant() == "file")
            {
                element.SendKeys(stringToType);
                return null;
            }
            
            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;
            if (executor != null)
            {
                JavaScriptLibrary.ExecuteScript(driver, this.type, element, stringToType);
            }
            else
            {
                element.SendKeys(stringToType);
            }

            return null;
        }
    }
}
