// <copyright file="IFindsByTagName.cs" company="WebDriver Committers">
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
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Defines the interface through which the user finds elements by their tag name.
    /// </summary>
    [Obsolete("The internal IFindsBy interfaces are being deprecated in favor of common implementation, and will be removed in the next full release.")]
    public interface IFindsByTagName
    {
        /// <summary>
        /// Finds the first element matching the specified tag name.
        /// </summary>
        /// <param name="tagName">The tag name to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        IWebElement FindElementByTagName(string tagName);

        /// <summary>
        /// Finds all elements matching the specified tag name.
        /// </summary>
        /// <param name="tagName">The tag name to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName);
    }
}
