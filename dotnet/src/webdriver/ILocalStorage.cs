// <copyright file="ILocalStorage.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
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

using System.Collections.Generic;

namespace OpenQA.Selenium
{
    using System.Collections.ObjectModel;

    /// <summary>
	///	An interface for interacting with the browser's local storage.
	/// </summary>
	public interface ILocalStorage
	{
		/// <summary>
        ///	Get all of the keys associated with the current web site.
		/// </summary>
		/// <returns>List of all keys that are currently in local storage.</returns>
        ReadOnlyCollection<string> GetAllKeys();

        /// <summary>
        ///	Get an item's value.
        /// </summary>
        /// <param name="key">The key that corresponds to the value being retrieved.</param>
        /// <returns>The item's value.</returns>
	    string GetItem(string key);

        /// <summary>
        /// Set an item's value.
        /// </summary>
        /// <param name="key">The key, which will be created or updated, depending on if 
        ///	the key already exists in local storage</param>
        /// <param name="value">The value that will be associated with the "key".</param>
		void SetItem(string key, string value);

        /// <summary>
        /// Get the number of storage items.
        /// </summary>
        /// <returns>number of storage items.</returns>
	    int GetSize();

        /// <summary>
        /// Delete a storage item with the given key.
        /// </summary>
        /// <param name="key">The key to delete.</param>
	    void DeleteItem(string key);

        /// <summary>
        /// Deletes all items and keys in local storage.
        /// </summary>
	    void ClearAllItems();
	}
}