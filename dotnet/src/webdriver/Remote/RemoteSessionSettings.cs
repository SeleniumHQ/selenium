// <copyright file="RemoteSessionSettings.cs" company="WebDriver Committers">
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
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using Newtonsoft.Json;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Base class for managing options specific to a browser driver.
    /// </summary>
    public class RemoteSessionSettings : ICapabilities
    {
        private const string FirstMatchCapabilityName = "firstMatch";
        private const string AlwaysMatchCapabilityName = "alwaysMatch";

        private readonly List<string> reservedSettingNames = new List<string>() { FirstMatchCapabilityName, AlwaysMatchCapabilityName };
        private DriverOptions mustMatchDriverOptions;
        private List<DriverOptions> firstMatchOptions = new List<DriverOptions>();
        private Dictionary<string, object> remoteMetadataSettings = new Dictionary<string, object>();

        /// <summary>
        /// Creates a new instance of the <see cref="RemoteSessionSettings"/> class.
        /// </summary>
        public RemoteSessionSettings()
        {
        }

        /// <summary>
        /// Creates a new instance of the <see cref="RemoteSessionSettings"/> class,
        /// containing the specified <see cref="DriverOptions"/> to use in the remote
        /// session.
        /// </summary>
        /// <param name="mustMatchDriverOptions">
        /// A <see cref="DriverOptions"/> object that contains values that must be matched
        /// by the remote end to create the remote session.
        /// </param>
        /// <param name="firstMatchDriverOptions">
        /// A list of <see cref="DriverOptions"/> objects that contain values that may be matched
        /// by the remote end to create the remote session.
        /// </param>
        public RemoteSessionSettings(DriverOptions mustMatchDriverOptions, params DriverOptions[] firstMatchDriverOptions)
        {
            this.mustMatchDriverOptions = mustMatchDriverOptions;
            foreach (DriverOptions firstMatchOption in firstMatchDriverOptions)
            {
                this.AddFirstMatchDriverOption(firstMatchOption);
            }
        }

        /// <summary>
        /// Gets a value indicating the options that must be matched by the remote end to create a session.
        /// </summary>
        internal DriverOptions MustMatchDriverOptions
        {
            get { return this.mustMatchDriverOptions; }
        }

        /// <summary>
        /// Gets a value indicating the number of options that may be matched by the remote end to create a session.
        /// </summary>
        internal int FirstMatchOptionsCount
        {
            get { return this.firstMatchOptions.Count; }
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
                if (capabilityName == AlwaysMatchCapabilityName)
                {
                    return this.GetAlwaysMatchOptionsAsSerializableDictionary();
                }

                if (capabilityName == FirstMatchCapabilityName)
                {
                    return this.GetFirstMatchOptionsAsSerializableList();
                }

                if (!this.remoteMetadataSettings.ContainsKey(capabilityName))
                {
                    throw new ArgumentException(string.Format(CultureInfo.InvariantCulture, "The capability {0} is not present in this set of capabilities", capabilityName));
                }

                return this.remoteMetadataSettings[capabilityName];
            }

        }

        /// <summary>
        /// Add a metadata setting to this set of remote session settings.
        /// </summary>
        /// <param name="settingName">The name of the setting to set.</param>
        /// <param name="settingValue">The value of the setting.</param>
        /// <remarks>
        /// The value to be set must be serializable to JSON for transmission
        /// across the wire to the remote end. To be JSON-serializable, the value
        /// must be a string, a numeric value, a boolean value, an object that
        /// implmeents <see cref="IEnumerable"/> that contains JSON-serializable
        /// objects, or a <see cref="Dictionary{TKey, TValue}"/> where the keys
        /// are strings and the values are JSON-serializable.
        /// </remarks>
        /// <exception cref="ArgumentException">
        /// Thrown if the setting name is null, the empty string, or one of the
        /// reserved names of metadata settings; or if the setting value is not
        /// JSON serializable.
        /// </exception>
        public void AddMetadataSetting(string settingName, object settingValue)
        {
            if (string.IsNullOrEmpty(settingName))
            {
                throw new ArgumentException("Metadata setting name cannot be null or empty", "settingName");
            }

            if (this.reservedSettingNames.Contains(settingName))
            {
                throw new ArgumentException(string.Format("'{0}' is a reserved name for a metadata setting, and cannot be used as a name.", settingName), "settingName");
            }

            if (!this.IsJsonSerializable(settingValue))
            {
                throw new ArgumentException("Metadata setting value must be JSON serializable.", "settingValue");
            }

            this.remoteMetadataSettings[settingName] = settingValue;
        }

        /// <summary>
        /// Adds a <see cref="DriverOptions"/> object to the list of options containing values to be
        /// "first matched" by the remote end.
        /// </summary>
        /// <param name="options">The <see cref="DriverOptions"/> to add to the list of "first matched" options.</param>
        public void AddFirstMatchDriverOption(DriverOptions options)
        {
            if (mustMatchDriverOptions != null)
            {
                DriverOptionsMergeResult mergeResult = mustMatchDriverOptions.GetMergeResult(options);
                if (mergeResult.IsMergeConflict)
                {
                    string msg = string.Format(CultureInfo.InvariantCulture, "You cannot request the same capability in both must-match and first-match capabilities. You are attempting to add a first-match driver options object that defines a capability, '{0}', that is already defined in the must-match driver options.", mergeResult.MergeConflictOptionName);
                    throw new ArgumentException(msg, "options");
                }
            }

            firstMatchOptions.Add(options);
        }

        /// <summary>
        /// Adds a <see cref="DriverOptions"/> object containing values that must be matched
        /// by the remote end to successfully create a session.
        /// </summary>
        /// <param name="options">The <see cref="DriverOptions"/> that must be matched by
        /// the remote end to successfully create a session.</param>
        public void SetMustMatchDriverOptions(DriverOptions options)
        {
            if (this.firstMatchOptions.Count > 0)
            {
                int driverOptionIndex = 0;
                foreach (DriverOptions firstMatchOption in this.firstMatchOptions)
                {
                    DriverOptionsMergeResult mergeResult = firstMatchOption.GetMergeResult(options);
                    if (mergeResult.IsMergeConflict)
                    {
                        string msg = string.Format(CultureInfo.InvariantCulture, "You cannot request the same capability in both must-match and first-match capabilities. You are attempting to add a must-match driver options object that defines a capability, '{0}', that is already defined in the first-match driver options with index {1}.", mergeResult.MergeConflictOptionName, driverOptionIndex);
                        throw new ArgumentException(msg, "options");
                    }

                    driverOptionIndex++;
                }
            }

            this.mustMatchDriverOptions = options;
        }

        /// <summary>
        /// Gets a value indicating whether the browser has a given capability.
        /// </summary>
        /// <param name="capability">The capability to get.</param>
        /// <returns>Returns <see langword="true"/> if this set of capabilities has the capability;
        /// otherwise, <see langword="false"/>.</returns>
        public bool HasCapability(string capability)
        {
            if (capability == AlwaysMatchCapabilityName || capability == FirstMatchCapabilityName)
            {
                return true;
            }

            return this.remoteMetadataSettings.ContainsKey(capability);
        }

        /// <summary>
        /// Gets a capability of the browser.
        /// </summary>
        /// <param name="capability">The capability to get.</param>
        /// <returns>An object associated with the capability, or <see langword="null"/>
        /// if the capability is not set in this set of capabilities.</returns>
        public object GetCapability(string capability)
        {
            if (capability == AlwaysMatchCapabilityName)
            {
                return this.GetAlwaysMatchOptionsAsSerializableDictionary();
            }

            if (capability == FirstMatchCapabilityName)
            {
                return this.GetFirstMatchOptionsAsSerializableList();
            }

            if (this.remoteMetadataSettings.ContainsKey(capability))
            {
                return this.remoteMetadataSettings[capability];
            }

            return null;
        }

        /// <summary>
        /// Return a dictionary representation of this <see cref="RemoteSessionSettings"/>.
        /// </summary>
        /// <returns>A <see cref="Dictionary{TKey, TValue}"/> representation of this <see cref="RemoteSessionSettings"/>.</returns>
        public Dictionary<string, object> ToDictionary()
        {
            Dictionary<string, object> capabilitiesDictionary = new Dictionary<string, object>();

            foreach (KeyValuePair<string, object> remoteMetadataSetting in this.remoteMetadataSettings)
            {
                capabilitiesDictionary[remoteMetadataSetting.Key] = remoteMetadataSetting.Value;
            }

            if (this.mustMatchDriverOptions != null)
            {
                capabilitiesDictionary["alwaysMatch"] = GetAlwaysMatchOptionsAsSerializableDictionary();
            }

            if (this.firstMatchOptions.Count > 0)
            {
                List<object> optionsMatches = GetFirstMatchOptionsAsSerializableList();

                capabilitiesDictionary["firstMatch"] = optionsMatches;
            }

            return capabilitiesDictionary;
        }

        /// <summary>
        /// Return a string representation of the remote session settings to be sent.
        /// </summary>
        /// <returns>String representation of the remote session settings to be sent.</returns>
        public override string ToString()
        {
            return JsonConvert.SerializeObject(this.ToDictionary(), Formatting.Indented);
        }

        internal DriverOptions GetFirstMatchDriverOptions(int firstMatchIndex)
        {
            if (firstMatchIndex < 0 || firstMatchIndex >= this.firstMatchOptions.Count)
            {
                throw new ArgumentException("Requested index must be greater than zero and less than the count of firstMatch options added.");
            }

            return this.firstMatchOptions[firstMatchIndex];
        }

        private IDictionary<string, object> GetAlwaysMatchOptionsAsSerializableDictionary()
        {
            return this.mustMatchDriverOptions.ToDictionary();
        }

        private List<object> GetFirstMatchOptionsAsSerializableList()
        {
            List<object> optionsMatches = new List<object>();
            foreach (DriverOptions options in this.firstMatchOptions)
            {
                optionsMatches.Add(options.ToDictionary());
            }

            return optionsMatches;
        }

        private bool IsJsonSerializable(object arg)
        {
            IEnumerable argAsEnumerable = arg as IEnumerable;
            IDictionary argAsDictionary = arg as IDictionary;

            if (arg is string || arg is float || arg is double || arg is int || arg is long || arg is bool || arg == null)
            {
                return true;
            }
            else if (argAsDictionary != null)
            {
                foreach (object key in argAsDictionary.Keys)
                {
                    if (!(key is string))
                    {
                        return false;
                    }
                }

                foreach (object value in argAsDictionary.Values)
                {
                    if (!IsJsonSerializable(value))
                    {
                        return false;
                    }
                }
            }
            else if (argAsEnumerable != null)
            {
                foreach (object item in argAsEnumerable)
                {
                    if (!IsJsonSerializable(item))
                    {
                        return false;
                    }
                }
            }
            else
            {
                return false;
            }

            return true;
        }
    }
}
