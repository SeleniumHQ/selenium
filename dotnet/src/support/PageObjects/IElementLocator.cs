// <copyright file="IElementLocator.cs" company="WebDriver Committers">
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
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Interface describing how elements are to be located by a <see cref="PageFactory"/>.
    /// </summary>
    /// <remarks>
    /// A locator must always contain a way to retrieve the <see cref="ISearchContext"/> to
    /// use in locating elements. In practice, this will usually be implemented by passing
    /// the context in via a constructor.
    /// </remarks>
    public interface IElementLocator
    {
        /// <summary>
        /// Gets the <see cref="ISearchContext"/> to be used in locating elements.
        /// </summary>
        ISearchContext SearchContext { get; }

        /// <summary>
        /// Locates an element using the given list of <see cref="By"/> criteria.
        /// </summary>
        /// <param name="bys">The list of methods by which to search for the element.</param>
        /// <returns>An <see cref="IWebElement"/> which is the first match under the desired criteria.</returns>
        IWebElement LocateElement(IEnumerable<By> bys);

        /// <summary>
        /// Locates a list of elements using the given list of <see cref="By"/> criteria.
        /// </summary>
        /// <param name="bys">The list of methods by which to search for the elements.</param>
        /// <returns>A list of all elements which match the desired criteria.</returns>
        ReadOnlyCollection<IWebElement> LocateElements(IEnumerable<By> bys);
    }
}
