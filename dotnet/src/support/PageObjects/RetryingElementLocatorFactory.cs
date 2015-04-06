﻿// <copyright file="RetryingElementLocatorFactory.cs" company="WebDriver Committers">
// Copyright 2015 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using System.Linq;
using System.Text;
using System.Threading;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// A locator for elements for use with the <see cref="PageFactory"/> that retries locating
    /// the element up to a timeout if the element is not found.
    /// </summary>
    [Obsolete("IElementLocatorFactory implementations are replaced by IElementLocator implementations. This class will be removed in a future release. Please use RetryingElementLocator instead.")]
    public class RetryingElementLocatorFactory : IElementLocatorFactory
    {
        private static readonly TimeSpan DefaultTimeout = TimeSpan.FromSeconds(5);
        private static readonly TimeSpan DefaultPollingInterval = TimeSpan.FromMilliseconds(500);

        private TimeSpan timeout;
        private TimeSpan pollingInterval;

        /// <summary>
        /// Initializes a new instance of the <see cref="RetryingElementLocatorFactory"/> class.
        /// </summary>
        public RetryingElementLocatorFactory()
            : this(DefaultTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RetryingElementLocatorFactory"/> class.
        /// </summary>
        /// <param name="timeout">The <see cref="TimeSpan"/> indicating how long the locator should
        /// retry before timing out.</param>
        public RetryingElementLocatorFactory(TimeSpan timeout)
            : this(timeout, DefaultPollingInterval)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RetryingElementLocatorFactory"/> class.
        /// </summary>
        /// <param name="timeout">The <see cref="TimeSpan"/> indicating how long the locator should
        /// retry before timing out.</param>
        /// <param name="pollingInterval">The <see cref="TimeSpan"/> indicating how often to poll
        /// for the existence of the element.</param>
        public RetryingElementLocatorFactory(TimeSpan timeout, TimeSpan pollingInterval)
        {
            this.timeout = timeout;
            this.pollingInterval = pollingInterval;
        }

        /// <summary>
        /// Creates an <see cref="IElementLocator"/> object used to locate elements.
        /// </summary>
        /// <param name="searchContext">The <see cref="ISearchContext"/> object that the 
        /// locator uses for locating elements.</param>
        /// <returns>The <see cref="IElementLocator"/> used to locate elements.</returns>
        public IElementLocator CreateLocator(ISearchContext searchContext)
        {
            if (searchContext == null)
            {
                throw new ArgumentNullException("searchContext", "searchContext may not be null");
            }

            return new RetryingElementLocator(searchContext, this.timeout, this.pollingInterval);
        }

        /// <summary>
        /// Locates an element using the given <see cref="ISearchContext"/> and list of <see cref="By"/> criteria.
        /// </summary>
        /// <param name="searchContext">The <see cref="ISearchContext"/> object within which to search for an element.</param>
        /// <param name="bys">The list of methods by which to search for the element.</param>
        /// <returns>An <see cref="IWebElement"/> which is the first match under the desired criteria.</returns>
        public IWebElement LocateElement(ISearchContext searchContext, IEnumerable<By> bys)
        {
            return this.CreateLocator(searchContext).LocateElement(bys);
        }

        /// <summary>
        /// Locates a list of elements using the given <see cref="ISearchContext"/> and list of <see cref="By"/> criteria.
        /// </summary>
        /// <param name="searchContext">The <see cref="ISearchContext"/> object within which to search for elements.</param>
        /// <param name="bys">The list of methods by which to search for the elements.</param>
        /// <returns>An list of all elements which match the desired criteria.</returns>
        public ReadOnlyCollection<IWebElement> LocateElements(ISearchContext searchContext, IEnumerable<By> bys)
        {
            return this.CreateLocator(searchContext).LocateElements(bys);
        }
    }
}
