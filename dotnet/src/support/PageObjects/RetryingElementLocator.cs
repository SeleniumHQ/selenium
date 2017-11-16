// <copyright file="RetryingElementLocator.cs" company="WebDriver Committers">
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
using System.Threading;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// A locator for elements for use with the <see cref="PageFactory"/> that retries locating
    /// the element up to a timeout if the element is not found.
    /// </summary>
    public class RetryingElementLocator : IElementLocator
    {
        private static readonly TimeSpan DefaultTimeout = TimeSpan.FromSeconds(5);
        private static readonly TimeSpan DefaultPollingInterval = TimeSpan.FromMilliseconds(500);

        private ISearchContext searchContext;
        private TimeSpan timeout;
        private TimeSpan pollingInterval;

        /// <summary>
        /// Initializes a new instance of the <see cref="RetryingElementLocator"/> class.
        /// </summary>
        /// <param name="searchContext">The <see cref="ISearchContext"/> object that the
        /// locator uses for locating elements.</param>
        public RetryingElementLocator(ISearchContext searchContext)
            : this(searchContext, DefaultTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RetryingElementLocator"/> class.
        /// </summary>
        /// <param name="searchContext">The <see cref="ISearchContext"/> object that the
        /// locator uses for locating elements.</param>
        /// <param name="timeout">The <see cref="TimeSpan"/> indicating how long the locator should
        /// retry before timing out.</param>
        public RetryingElementLocator(ISearchContext searchContext, TimeSpan timeout)
            : this(searchContext, timeout, DefaultPollingInterval)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RetryingElementLocator"/> class.
        /// </summary>
        /// <param name="searchContext">The <see cref="ISearchContext"/> object that the
        /// locator uses for locating elements.</param>
        /// <param name="timeout">The <see cref="TimeSpan"/> indicating how long the locator should
        /// retry before timing out.</param>
        /// <param name="pollingInterval">The <see cref="TimeSpan"/> indicating how often to poll
        /// for the existence of the element.</param>
        public RetryingElementLocator(ISearchContext searchContext, TimeSpan timeout, TimeSpan pollingInterval)
        {
            this.searchContext = searchContext;
            this.timeout = timeout;
            this.pollingInterval = pollingInterval;
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
            DateTime endTime = DateTime.Now.Add(this.timeout);
            bool timeoutReached = DateTime.Now > endTime;
            while (!timeoutReached)
            {
                foreach (var by in bys)
                {
                    try
                    {
                        return this.SearchContext.FindElement(by);
                    }
                    catch (NoSuchElementException)
                    {
                        errorString = (errorString == null ? "Could not find element by: " : errorString + ", or: ") + by;
                    }
                }

                timeoutReached = DateTime.Now > endTime;
                if (!timeoutReached)
                {
                    Thread.Sleep(this.pollingInterval);
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
            DateTime endTime = DateTime.Now.Add(this.timeout);
            bool timeoutReached = DateTime.Now > endTime;
            while (!timeoutReached)
            {
                foreach (var by in bys)
                {
                    ReadOnlyCollection<IWebElement> list = this.SearchContext.FindElements(by);
                    collection.AddRange(list);
                }

                timeoutReached = collection.Count != 0 || DateTime.Now > endTime;
                if (!timeoutReached)
                {
                    Thread.Sleep(this.pollingInterval);
                }
            }

            return collection.AsReadOnly();
        }
    }
}
#endif
