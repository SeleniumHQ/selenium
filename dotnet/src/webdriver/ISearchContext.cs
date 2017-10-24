// <copyright file="ISearchContext.cs" company="WebDriver Committers">
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

using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines the interface used to search for elements.
    /// </summary>
    public interface ISearchContext
    {
        /// <summary>
        /// Finds the first <see cref="IWebElement"/> using the given method.
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>The first matching <see cref="IWebElement"/> on the current context.</returns>
        /// <exception cref="NoSuchElementException">If no element matches the criteria.</exception>
        IWebElement FindElement(By by);

        /// <summary>
        /// Finds all <see cref="IWebElement">IWebElements</see> within the current context
        /// using the given mechanism.
        /// </summary>
        /// <param name="by">The locating mechanism to use.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> of all <see cref="IWebElement">WebElements</see>
        /// matching the current criteria, or an empty list if nothing matches.</returns>
        ReadOnlyCollection<IWebElement> FindElements(By by);
    }
}
