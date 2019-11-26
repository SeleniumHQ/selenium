// <copyright file="ReturnedCapabilities.cs" company="WebDriver Committers">
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
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using Newtonsoft.Json;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Class to Create the capabilities of the browser you require for <see cref="IWebDriver"/>.
    /// If you wish to use default values use the static methods
    /// </summary>
    internal class ReturnedCapabilities : ICapabilities, IHasCapabilitiesDictionary
    {
        private readonly Dictionary<string, object> capabilities = new Dictionary<string, object>();

        /// <summary>
        /// Initializes a new instance of the <see cref="ReturnedCapabilities"/> class
        /// </summary>
        public ReturnedCapabilities()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ReturnedCapabilities"/> class
        /// </summary>
        /// <param name="rawMap">Dictionary of items for the remote driver</param>
        public ReturnedCapabilities(Dictionary<string, object> rawMap)
        {
            if (rawMap != null)
            {
                foreach (string key in rawMap.Keys)
                {
                    this.capabilities[key] = rawMap[key];
                }
            }
        }

        /// <summary>
        /// Gets the browser name
        /// </summary>
        public string BrowserName
        {
            get
            {
                string name = string.Empty;
                object capabilityValue = this.GetCapability(CapabilityType.BrowserName);
                if (capabilityValue != null)
                {
                    name = capabilityValue.ToString();
                }

                return name;
            }
        }

        /// <summary>
        /// Gets the capability value with the specified name.
        /// </summary>
        /// <param name="capabilityName">The name of the capability to get.</param>
        /// <returns>The value of the capability.</returns>
        /// <exception cref="ArgumentException">
        /// The specified capability name is not in the set of capabilities.
        /// </exception>
        public object this[string capabilityName]
        {
            get
            {
                if (!this.capabilities.ContainsKey(capabilityName))
                {
                    throw new ArgumentException(string.Format(CultureInfo.InvariantCulture, "The capability {0} is not present in this set of capabilities", capabilityName));
                }

                return this.capabilities[capabilityName];
            }
        }

        /// <summary>
        /// Gets the underlying Dictionary for a given set of capabilities.
        /// </summary>
        IDictionary<string, object> IHasCapabilitiesDictionary.CapabilitiesDictionary
        {
            get { return this.CapabilitiesDictionary; }
        }

        /// <summary>
        /// Gets the internal capabilities dictionary.
        /// </summary>
        internal IDictionary<string, object> CapabilitiesDictionary
        {
            get { return new ReadOnlyDictionary<string, object>(this.capabilities); }
        }

        /// <summary>
        /// Gets a value indicating whether the browser has a given capability.
        /// </summary>
        /// <param name="capability">The capability to get.</param>
        /// <returns>Returns <see langword="true"/> if the browser has the capability; otherwise, <see langword="false"/>.</returns>
        public bool HasCapability(string capability)
        {
            return this.capabilities.ContainsKey(capability);
        }

        /// <summary>
        /// Gets a capability of the browser.
        /// </summary>
        /// <param name="capability">The capability to get.</param>
        /// <returns>An object associated with the capability, or <see langword="null"/>
        /// if the capability is not set on the browser.</returns>
        public object GetCapability(string capability)
        {
            object capabilityValue = null;
            if (this.capabilities.ContainsKey(capability))
            {
                capabilityValue = this.capabilities[capability];
            }

            return capabilityValue;
        }

        /// <summary>
        /// Converts the <see cref="ICapabilities"/> object to a <see cref="Dictionary{TKey, TValue}"/>.
        /// </summary>
        /// <returns>The <see cref="Dictionary{TKey, TValue}"/> containing the capabilities.</returns>
        public Dictionary<string, object> ToDictionary()
        {
            // CONSIDER: Instead of returning the raw internal member,
            // we might want to copy/clone it instead.
            return this.capabilities;
        }

        /// <summary>
        /// Return a string of capabilities being used
        /// </summary>
        /// <returns>String of capabilities being used</returns>
        public override string ToString()
        {
            return JsonConvert.SerializeObject(this.capabilities, Formatting.Indented);
        }
    }
}
