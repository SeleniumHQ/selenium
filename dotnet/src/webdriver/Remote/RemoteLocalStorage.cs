// <copyright file="RemoteLocalStorage.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Remote
{
    using System;
    using System.Collections.Generic;
    using System.Collections.ObjectModel;
    using System.Linq;

    /// <summary>
    /// Interact with a remote browser's local storage.
    /// </summary>
    public class RemoteLocalStorage : ILocalStorage
    {
        /// <summary>
        /// The driver that we will be interacting with.
        /// </summary>
        private readonly RemoteWebDriver _driver;

        /// <summary>
        /// Create a RemoveLocalStorage that interacts with the given RemoteWebDriver.
        /// </summary>
        /// <param name="driverToUse"></param>
        public RemoteLocalStorage(RemoteWebDriver driverToUse)
        {
            _driver = driverToUse;
        }

        /// <summary>
        ///	Get all of the keys associated with the current web site.
        /// </summary>
        /// <returns>List of all keys that are currently in local storage.</returns>
        public ReadOnlyCollection<string> Keys
        {
            get
            {
                return this.GetAllKeys();
            }
        }

        /// <summary>
        ///	Get all of the keys associated with the current web site.
        /// </summary>
        /// <returns>List of all keys that are currently in local storage.</returns>
        public ReadOnlyCollection<string> GetAllKeys()
        {
            // execut the command and convert to an object[]
            object[] keysAsObjects = _driver.InternalExecute(DriverCommand.LocalStorageGetKeys, null).Value as object[];
            IList<string> resultKeys = new List<string>();

            // if the keysAsObjects is null, return null because
            // the response didn't even contain an array!
            if (keysAsObjects == null)
            {
                return null;
            }

            // loop through each one and convert to a string
            foreach (object keyObject in keysAsObjects)
            {
                // skip this one if it is null
                if (keyObject == null)
                {
                    continue;
                }

                // add the item to the list of keys
                resultKeys.Add(keyObject.ToString());
            }

            // return the list of keys as a ReadOnlyCollection
            return new ReadOnlyCollection<string>(resultKeys);
        }

        /// <summary>
        ///	Get an item's value.
        /// </summary>
        /// <param name="key">The key that corresponds to the value being retrieved.</param>
        /// <returns>The item's value.</returns>
        public string GetItem(string key)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "key", key }
            };
            return (string)_driver.InternalExecute(DriverCommand.LocalStorageGetItem, parameters).Value;
        }

        /// <summary>
        /// Set an item's value.
        /// </summary>
        /// <param name="key">The key, which will be created or updated, depending on if 
        ///	the key already exists in local storage</param>
        /// <param name="value">The value that will be associated with the "key".</param>
        public void SetItem(string key, string value)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "key", key },
                { "value", value }
            };
            _driver.InternalExecute(DriverCommand.LocalStorageSetItem, parameters);
        }

        /// <summary>
        /// Get the number of storage items.
        /// </summary>
        /// <returns>number of storage items.</returns>
        public int GetSize()
        {
            return Convert.ToInt32(_driver.InternalExecute(DriverCommand.LocalStorageSize, null).Value);
        }

        /// <summary>
        /// Delete a storage item with the given key.
        /// </summary>
        /// <param name="key">The key to delete.</param>
        public void DeleteItem(string key)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "key", key }
            };
            _driver.InternalExecute(DriverCommand.LocalStorageDeleteItem, parameters);
        }

        /// <summary>
        /// Deletes all items and keys in local storage.
        /// </summary>
        public void ClearAllItems()
        {
            _driver.InternalExecute(DriverCommand.LocalStorageClear, null);
        }
    }
}
