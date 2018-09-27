// <copyright file="ISessionStorage.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Html5
{
    /// <summary>
    /// Represents the session storage for the site currently opened in the browser.
    /// Each site has its own separate storage area.
    /// </summary>
    public interface ISessionStorage
    {
        /// <summary>
        /// Gets the number of items in session storage.
        /// </summary>
        int Count { get; }

        /// <summary>
        /// Returns value of the session storage given a key.
        /// </summary>
        /// <param name="key">key to for a session storage entry</param>
        /// <returns>Value of the session storage entry as <see cref="string"/> given a key.</returns>
        string GetItem(string key);

        /// <summary>
        /// Returns the set of keys associated with session storage.
        /// </summary>
        /// <returns>Returns the set of keys associated with session storage as <see cref="HashSet{T}"/>.</returns>
        ReadOnlyCollection<string> KeySet();

        /// <summary>
        /// Adds key/value pair to session storage.
        /// </summary>
        /// <param name="key">storage key</param>
        /// <param name="value">storage value</param>
        void SetItem(string key, string value);

        /// <summary>
        /// Removes key/value pair from session storage.
        /// </summary>
        /// <param name="key">key to remove from storage</param>
        /// <returns>Value from session storage as <see cref="string">string</see> for the given key.</returns>
        string RemoveItem(string key);

        /// <summary>
        /// Clears local storage.
        /// </summary>
        void Clear();
    }
}
