// <copyright file="IFindsElement.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Defines the interface through which the user finds elements by a strategy and value.
    /// </summary>
    public interface IFindsElement
    {
        /// <summary>
        /// Finds the first element matching the specified value using the specified mechanism.
        /// </summary>
        /// <param name="mechanism">The mechanism to use when matching.</param>
        /// <param name="value">The value to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        IWebElement FindElement(string mechanism, string value);

        /// <summary>
        /// Finds all elements matching the specified value using the specified mechanism.
        /// </summary>
        /// <param name="mechanism">The mechanism to use when matching.</param>
        /// <param name="value">The value to match.</param>
        /// <returns><see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        ReadOnlyCollection<IWebElement> FindElements(string mechanism, string value);
    }
}
