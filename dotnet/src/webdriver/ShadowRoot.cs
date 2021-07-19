// <copyright file="ShadowRoot.cs" company="WebDriver Committers">
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
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides a representation of an element's shadow root.
    /// </summary>
    public class ShadowRoot : ISearchContext, IWrapsDriver
    {
        /// <summary>
        /// The property name that represents an element shadow root in the wire protocol.
        /// </summary>
        public const string ShadowRootReferencePropertyName = "shadow-6066-11e4-a52e-4f735466cecf";

        private WebDriver driver;
        private string shadowRootId;

        /// <summary>
        /// Initializes a new instance of the <see cref="ShadowRoot"/> class.
        /// </summary>
        /// <param name="parentDriver">The <see cref="WebDriver"/> instance that is driving this shadow root.</param>
        /// <param name="id">The ID value provided to identify the shadow root.</param>
        public ShadowRoot(WebDriver parentDriver, string id)
        {
            this.driver = parentDriver;
            this.shadowRootId = id;
        }

        /// <summary>
        /// Gets the <see cref="IWebDriver"/> driving this shadow root.
        /// </summary>
        public IWebDriver WrappedDriver
        {
            get { return this.driver; }
        }

        /// <summary>
        /// Finds the first <see cref="IWebElement"/> using the given method.
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>The first matching <see cref="IWebElement"/> on the current context.</returns>
        /// <exception cref="NoSuchElementException">If no element matches the criteria.</exception>
        public IWebElement FindElement(By by)
        {
            if (by == null)
            {
                throw new ArgumentNullException("by", "by cannot be null");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.shadowRootId);
            parameters.Add("using", by.Mechanism);
            parameters.Add("value", by.Criteria);
            Response commandResponse = this.driver.InternalExecute(DriverCommand.FindShadowChildElement, parameters);
            return this.driver.GetElementFromResponse(commandResponse);
        }

        /// <summary>
        /// Finds all <see cref="IWebElement">IWebElements</see> within the current context
        /// using the given mechanism.
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> of all <see cref="IWebElement">WebElements</see>
        /// matching the current criteria, or an empty list if nothing matches.</returns>
        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            if (by == null)
            {
                throw new ArgumentNullException("by", "by cannot be null");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("id", this.shadowRootId);
            parameters.Add("using", by.Mechanism);
            parameters.Add("value", by.Criteria);
            Response commandResponse = this.driver.InternalExecute(DriverCommand.FindShadowChildElements, parameters);
            return this.driver.GetElementsFromResponse(commandResponse);
        }
    }
}
