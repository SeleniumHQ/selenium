// <copyright file="ReturnedCapabilities.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;

namespace OpenQA.Selenium.Internal;

/// <summary>
/// Class to Create the capabilities of the browser you require for <see cref="IWebDriver"/>.
/// If you wish to use default values use the static methods
/// </summary>
internal sealed class ReturnedCapabilities : ICapabilities, IHasCapabilitiesDictionary
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
    public ReturnedCapabilities(Dictionary<string, object>? rawMap)
    {
        if (rawMap != null)
        {
            foreach (KeyValuePair<string, object> rawItem in rawMap)
            {
                this.capabilities[rawItem.Key] = rawItem.Value;
            }
        }
    }

    /// <summary>
    /// Gets the browser name, or <see cref="string.Empty"/> if not specified.
    /// </summary>
    public string BrowserName
    {
        get
        {
            object? capabilityValue = this.GetCapability(CapabilityType.BrowserName);
            return capabilityValue?.ToString() ?? string.Empty;
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
            if (!this.capabilities.TryGetValue(capabilityName, out object? capabilityValue))
            {
                throw new ArgumentException(string.Format(CultureInfo.InvariantCulture, "The capability {0} is not present in this set of capabilities", capabilityName));
            }

            return capabilityValue;
        }
    }

    /// <summary>
    /// Gets the underlying Dictionary for a given set of capabilities.
    /// </summary>
    IDictionary<string, object> IHasCapabilitiesDictionary.CapabilitiesDictionary => this.CapabilitiesDictionary;

    /// <summary>
    /// Gets the internal capabilities dictionary.
    /// </summary>
    internal IDictionary<string, object> CapabilitiesDictionary => new ReadOnlyDictionary<string, object>(this.capabilities);

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
    public object? GetCapability(string capability)
    {
        if (this.capabilities.TryGetValue(capability, out object? capabilityValue))
        {
            return capabilityValue;
        }

        return null;
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
}
