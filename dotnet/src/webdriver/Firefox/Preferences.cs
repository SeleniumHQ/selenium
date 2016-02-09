// <copyright file="Preferences.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.IO;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Represents the preferences used by a profile in Firefox.
    /// </summary>
    internal class Preferences
    {
        private Dictionary<string, string> preferences = new Dictionary<string, string>();
        private Dictionary<string, string> immutablePreferences = new Dictionary<string, string>();

        /// <summary>
        /// Initializes a new instance of the <see cref="Preferences"/> class.
        /// </summary>
        /// <param name="defaultImmutablePreferences">A set of preferences that cannot be modified once set.</param>
        /// <param name="defaultPreferences">A set of default preferences.</param>
        public Preferences(Dictionary<string, object> defaultImmutablePreferences, Dictionary<string, object> defaultPreferences)
        {
            if (defaultImmutablePreferences != null)
            {
                foreach (KeyValuePair<string, object> pref in defaultImmutablePreferences)
                {
                    this.SetPreferenceValue(pref.Key, pref.Value);
                    this.immutablePreferences.Add(pref.Key, pref.Value.ToString());
                }
            }

            if (defaultPreferences != null)
            {
                foreach (KeyValuePair<string, object> pref in defaultPreferences)
                {
                    this.SetPreferenceValue(pref.Key, pref.Value);
                }
            }
        }

        /// <summary>
        /// Sets a preference.
        /// </summary>
        /// <param name="key">The name of the preference to set.</param>
        /// <param name="value">A <see cref="string"/> value give the preference.</param>
        /// <remarks>If the preference already exists in the currently-set list of preferences,
        /// the value will be updated.</remarks>
        internal void SetPreference(string key, string value)
        {
            this.SetPreferenceValue(key, value);
        }

        /// <summary>
        /// Sets a preference.
        /// </summary>
        /// <param name="key">The name of the preference to set.</param>
        /// <param name="value">A <see cref="int"/> value give the preference.</param>
        /// <remarks>If the preference already exists in the currently-set list of preferences,
        /// the value will be updated.</remarks>
        internal void SetPreference(string key, int value)
        {
            this.SetPreferenceValue(key, value);
        }

        /// <summary>
        /// Sets a preference.
        /// </summary>
        /// <param name="key">The name of the preference to set.</param>
        /// <param name="value">A <see cref="bool"/> value give the preference.</param>
        /// <remarks>If the preference already exists in the currently-set list of preferences,
        /// the value will be updated.</remarks>
        internal void SetPreference(string key, bool value)
        {
            this.SetPreferenceValue(key, value);
        }

        /// <summary>
        /// Gets a preference from the list of preferences.
        /// </summary>
        /// <param name="preferenceName">The name of the preference to retrieve.</param>
        /// <returns>The value of the preference, or an empty string if the preference is not set.</returns>
        internal string GetPreference(string preferenceName)
        {
            if (this.preferences.ContainsKey(preferenceName))
            {
                return this.preferences[preferenceName];
            }

            return string.Empty;
        }

        /// <summary>
        /// Appends this set of preferences to the specified set of preferences.
        /// </summary>
        /// <param name="preferencesToAdd">A dictionary containing the preferences to which to
        /// append these values.</param>
        /// <remarks>If the preference already exists in <paramref name="preferencesToAdd"/>,
        /// the value will be updated.</remarks>
        internal void AppendPreferences(Dictionary<string, string> preferencesToAdd)
        {
            // This allows the user to add additional preferences, or update ones that already
            // exist.
            foreach (KeyValuePair<string, string> preferenceToAdd in preferencesToAdd)
            {
                if (this.IsSettablePreference(preferenceToAdd.Key))
                {
                    this.preferences[preferenceToAdd.Key] = preferenceToAdd.Value;
                }
            }
        }

        /// <summary>
        /// Writes the preferences to a file.
        /// </summary>
        /// <param name="filePath">The full path to the file to be written.</param>
        internal void WriteToFile(string filePath)
        {
            using (TextWriter writer = File.CreateText(filePath))
            {
                foreach (KeyValuePair<string, string> preference in this.preferences)
                {
                    string escapedValue = preference.Value.Replace(@"\", @"\\");
                    writer.WriteLine(string.Format(CultureInfo.InvariantCulture, "user_pref(\"{0}\", {1});", preference.Key, escapedValue));
                }
            }
        }

        private static bool IsWrappedAsString(string value)
        {
            // Assume we a string is stringified (i.e. wrapped in " ") when
            // the first character == " and the last character == "
            return value.StartsWith("\"", StringComparison.OrdinalIgnoreCase) && value.EndsWith("\"", StringComparison.OrdinalIgnoreCase);
        }

        private bool IsSettablePreference(string preferenceName)
        {
            return !this.immutablePreferences.ContainsKey(preferenceName);
        }

        private void SetPreferenceValue(string key, object value)
        {
            if (!this.IsSettablePreference(key))
            {
                string message = string.Format(CultureInfo.InvariantCulture, "Preference {0} may not be overridden: frozen value={1}, requested value={2}", key, this.immutablePreferences[key], value.ToString());
                throw new ArgumentException(message);
            }

            string stringValue = value as string;
            if (stringValue != null)
            {
                if (IsWrappedAsString(stringValue))
                {
                    throw new ArgumentException(string.Format(CultureInfo.InvariantCulture, "Preference values must be plain strings: {0}: {1}", key, value));
                }

                this.preferences[key] = string.Format(CultureInfo.InvariantCulture, "\"{0}\"", value);
                return;
            }

            if (value is bool)
            {
                this.preferences[key] = Convert.ToBoolean(value, CultureInfo.InvariantCulture).ToString().ToLowerInvariant();
                return;
            }

            if (value is int || value is long)
            {
                this.preferences[key] = Convert.ToInt32(value, CultureInfo.InvariantCulture).ToString(CultureInfo.InvariantCulture);
                return;
            }

            throw new WebDriverException("Value must be string, int or boolean");
        }
    }
}
