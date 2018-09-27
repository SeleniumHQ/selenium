// <copyright file="FindElementEventArgs.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Support.Events
{
    /// <summary>
    /// Provides data for events related to finding elements.
    /// </summary>
    public class FindElementEventArgs : EventArgs
    {
        private IWebDriver driver;
        private IWebElement element;
        private By method;

        /// <summary>
        /// Initializes a new instance of the <see cref="FindElementEventArgs"/> class.
        /// </summary>
        /// <param name="driver">The WebDriver instance used in finding elements.</param>
        /// <param name="method">The <see cref="By"/> object containing the method used to find elements</param>
        public FindElementEventArgs(IWebDriver driver, By method)
            : this(driver, null, method)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FindElementEventArgs"/> class.
        /// </summary>
        /// <param name="driver">The WebDriver instance used in finding elements.</param>
        /// <param name="element">The parent element used as the context for the search.</param>
        /// <param name="method">The <see cref="By"/> object containing the method used to find elements.</param>
        public FindElementEventArgs(IWebDriver driver, IWebElement element, By method)
        {
            this.driver = driver;
            this.element = element;
            this.method = method;
        }

        /// <summary>
        /// Gets the WebDriver instance used in finding elements.
        /// </summary>
        public IWebDriver Driver
        {
            get { return this.driver; }
        }

        /// <summary>
        /// Gets the parent element used as the context for the search.
        /// </summary>
        public IWebElement Element
        {
            get { return this.element; }
        }

        /// <summary>
        /// Gets the <see cref="By"/> object containing the method used to find elements.
        /// </summary>
        public By FindMethod
        {
            get { return this.method; }
        }
    }
}
