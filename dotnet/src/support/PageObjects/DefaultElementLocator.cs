// <copyright file="DefaultElementLocator.cs" company="WebDriver Committers">
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

#if !NETSTANDARD2_0
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// A default locator for elements for use with the <see cref="PageFactory"/>. This locator
    /// implements no retry logic for elements not being found, nor for elements being stale.
    /// </summary>
    public class DefaultElementLocator : IElementLocator
    {
        private ISearchContext searchContext;

        /// <summary>
        /// Initializes a new instance of the <see cref="DefaultElementLocator"/> class.
        /// </summary>
        /// <param name="searchContext">The <see cref="ISearchContext"/> used by this locator
        /// to locate elements.</param>
        public DefaultElementLocator(ISearchContext searchContext)
        {
            this.searchContext = searchContext;
        }

        /// <summary>
        /// Gets the <see cref="ISearchContext"/> to be used in locating elements.
        /// </summary>
        public ISearchContext SearchContext
        {
            get { return this.searchContext; }
        }

        /// <summary>
        /// Locates an element using the given list of <see cref="By"/> criteria.
        /// </summary>
        /// <param name="bys">The list of methods by which to search for the element.</param>
        /// <returns>An <see cref="IWebElement"/> which is the first match under the desired criteria.</returns>
        public IWebElement LocateElement(IEnumerable<By> bys)
        {
            if (bys == null)
            {
                throw new ArgumentNullException("bys", "List of criteria may not be null");
            }

            string errorString = null;
            foreach (var by in bys)
            {
                try
                {
                    return this.searchContext.FindElement(by);
                }
                catch (NoSuchElementException)
                {
                    errorString = (errorString == null ? "Could not find element by: " : errorString + ", or: ") + by;
                }
            }

            throw new NoSuchElementException(errorString);
        }

        /// <summary>
        /// Locates a list of elements using the given list of <see cref="By"/> criteria.
        /// </summary>
        /// <param name="bys">The list of methods by which to search for the elements.</param>
        /// <returns>A list of all elements which match the desired criteria.</returns>
        public ReadOnlyCollection<IWebElement> LocateElements(IEnumerable<By> bys)
        {
            if (bys == null)
            {
                throw new ArgumentNullException("bys", "List of criteria may not be null");
            }

            List<IWebElement> collection = new List<IWebElement>();
            foreach (var by in bys)
            {
                ReadOnlyCollection<IWebElement> list = this.searchContext.FindElements(by);
                collection.AddRange(list);
            }

            return collection.AsReadOnly();
        }
    }
}
#endif
