// <copyright file="WebElementValueEventArgs.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Support.Events
{
    /// <summary>
    /// Provides data for events related to finding elements.
    /// </summary>
    public class WebElementValueEventArgs : WebElementEventArgs
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="WebElementValueEventArgs"/> class.
        /// </summary>
        /// <param name="driver">The WebDriver instance used for the action.</param>
        /// <param name="element">The element used for the action.</param>
        /// <param name="value">The new value for the element.</param>
        public WebElementValueEventArgs(IWebDriver driver, IWebElement element, string value)
            : base(driver, element)
        {
            this.Value = value;
        }

        /// <summary>
        /// Gets the Value that is written to the element
        /// </summary>
        public string Value { get; private set; }
    }
}
