// <copyright file="IElementLocatorFactory.cs" company="WebDriver Committers">
// Copyright 2014 Software Freedom Conservancy
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

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Interface describing how elements are to be located by a <see cref="PageFactory"/>
    /// </summary>
    public interface IElementLocatorFactory
    {
        /// <summary>
        /// Locates an element using the given <see cref="ISearchContext"/> and list of <see cref="By"/> criteria.
        /// </summary>
        /// <param name="searchContext">The <see cref="ISearchContext"/> object within which to search for an element.</param>
        /// <param name="bys">The list of methods by which to search for the element.</param>
        /// <returns>An <see cref="IWebElement"/> which is the first match under the desired criteria.</returns>
        IWebElement LocateElement(ISearchContext searchContext, IEnumerable<By> bys);

        /// <summary>
        /// Locates a list of elements using the given <see cref="ISearchContext"/> and list of <see cref="By"/> criteria.
        /// </summary>
        /// <param name="searchContext">The <see cref="ISearchContext"/> object within which to search for elements.</param>
        /// <param name="bys">The list of methods by which to search for the elements.</param>
        /// <returns>An list of all elements which match the desired criteria.</returns>
        ReadOnlyCollection<IWebElement> LocateElements(ISearchContext searchContext, IEnumerable<By> bys);
    }
}
