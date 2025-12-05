// <copyright file="Preferences.cs" company="Selenium Committers">
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
using System.Globalization;
using System.IO;
using System.Text.Json;

namespace OpenQA.Selenium.Firefox;

/// <summary>
/// Represents the preferences used by a profile in Firefox.
/// </summary>
internal class Preferences
{
    private readonly Dictionary<string, string> preferences = new Dictionary<string, string>();
    private readonly HashSet<string> immutablePreferences = new HashSet<string>();

    /// <summary>
    /// Initializes a new instance of the <see cref="Preferences"/> class.
    /// </summary>
    /// <param name="defaultImmutablePreferences">A set of preferences that cannot be modified once set.</param>
    /// <param name="defaultPreferences">A set of default preferences.</param>
    public Preferences(JsonElement defaultImmutablePreferences, JsonElement defaultPreferences)
    {
        foreach (JsonProperty pref in defaultImmutablePreferences.EnumerateObject())
        {
            this.ThrowIfPreferenceIsImmutable(pref.Name, pref.Value);
            this.preferences[pref.Name] = pref.Value.GetRawText();
            this.immutablePreferences.Add(pref.Name);
        }

        foreach (JsonProperty pref in defaultPreferences.EnumerateObject())
        {
            this.ThrowIfPreferenceIsImmutable(pref.Name, pref.Value);
            this.preferences[pref.Name] = pref.Value.GetRawText();
        }
    }

    /// <summary>
    /// Sets a preference.
    /// </summary>
    /// <param name="key">The name of the preference to set.</param>
    /// <param name="value">A <see cref="string"/> value give the preference.</param>
    /// <remarks>If the preference already exists in the currently-set list of preferences,
    /// the value will be updated.</remarks>
    /// <exception cref="ArgumentNullException">If <paramref name="key"/> or <paramref name="value"/> are <see langword="null"/>.</exception>
    /// <exception cref="ArgumentException">
    /// <para>If <paramref name="value"/> is wrapped with double-quotes.</para>
    /// <para>-or-</para>
    /// <para>If the specified preference is immutable.</para>
    /// </exception>
    internal void SetPreference(string key, string value)
    {
        if (key is null)
        {
            throw new ArgumentNullException(nameof(key));
        }

        if (value is null)
        {
            throw new ArgumentNullException(nameof(value));
        }

        if (IsWrappedAsString(value))
        {
            throw new ArgumentException(string.Format(CultureInfo.InvariantCulture, "Preference values must be plain strings: {0}: {1}", key, value));
        }

        this.ThrowIfPreferenceIsImmutable(key, value);
        this.preferences[key] = string.Format(CultureInfo.InvariantCulture, "\"{0}\"", value);
    }

    /// <summary>
    /// Sets a preference.
    /// </summary>
    /// <param name="key">The name of the preference to set.</param>
    /// <param name="value">A <see cref="int"/> value give the preference.</param>
    /// <remarks>If the preference already exists in the currently-set list of preferences,
    /// the value will be updated.</remarks>
    /// <exception cref="ArgumentNullException">If <paramref name="key"/> is <see langword="null"/>.</exception>
    /// <exception cref="ArgumentException">If the specified preference is immutable.</exception>
    internal void SetPreference(string key, int value)
    {
        if (key is null)
        {
            throw new ArgumentNullException(nameof(key));
        }

        this.ThrowIfPreferenceIsImmutable(key, value);
        this.preferences[key] = value.ToString(CultureInfo.InvariantCulture);
    }

    /// <summary>
    /// Sets a preference.
    /// </summary>
    /// <param name="key">The name of the preference to set.</param>
    /// <param name="value">A <see cref="bool"/> value give the preference.</param>
    /// <remarks>If the preference already exists in the currently-set list of preferences,
    /// the value will be updated.</remarks>
    /// <exception cref="ArgumentNullException">If <paramref name="key"/> is <see langword="null"/>.</exception>
    /// <exception cref="ArgumentException">If the specified preference is immutable.</exception>
    internal void SetPreference(string key, bool value)
    {
        if (key is null)
        {
            throw new ArgumentNullException(nameof(key));
        }

        this.ThrowIfPreferenceIsImmutable(key, value);
        this.preferences[key] = value ? "true" : "false";
    }

    /// <summary>
    /// Gets a preference from the list of preferences.
    /// </summary>
    /// <param name="preferenceName">The name of the preference to retrieve.</param>
    /// <returns>The value of the preference, or an empty string if the preference is not set.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="preferenceName"/> is <see langword="null"/>.</exception>
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

    private void ThrowIfPreferenceIsImmutable<TValue>(string preferenceName, TValue value)
    {
        if (this.immutablePreferences.Contains(preferenceName))
        {
            string message = string.Format(CultureInfo.InvariantCulture, "Preference {0} may not be overridden: frozen value={1}, requested value={2}", preferenceName, this.preferences[preferenceName], value?.ToString());
            throw new ArgumentException(message);
        }
    }

    private bool IsSettablePreference(string preferenceName)
    {
        return !this.immutablePreferences.Contains(preferenceName);
    }
}
