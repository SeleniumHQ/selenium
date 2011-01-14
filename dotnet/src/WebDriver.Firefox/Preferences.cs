using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Represents the preferences used by a profile in Firefox.
    /// </summary>
    internal class Preferences
    {
        #region Private members
        private Dictionary<string, string> additionalPrefs = new Dictionary<string, string>(); 
        #endregion

        #region Methods
        /// <summary>
        /// Sets a preference.
        /// </summary>
        /// <param name="key">The name of the preference to set.</param>
        /// <param name="value">A <see cref="System.String"/> value give the preference.</param>
        internal void SetPreference(string key, string value)
        {
            if (IsWrappedAsString(value))
            {
                throw new ArgumentException(string.Format(CultureInfo.InvariantCulture, "Preference values must be plain strings: {0}: {1}", key, value));
            }

            additionalPrefs.Add(key, string.Format(CultureInfo.InvariantCulture, "\"{0}\"", value));
        }

        /// <summary>
        /// Sets a preference.
        /// </summary>
        /// <param name="key">The name of the preference to set.</param>
        /// <param name="value">A <see cref="System.Int32"/> value give the preference.</param>
        internal void SetPreference(string key, int value)
        {
            additionalPrefs.Add(key, value.ToString(CultureInfo.InvariantCulture));
        }

        /// <summary>
        /// Sets a preference.
        /// </summary>
        /// <param name="key">The name of the preference to set.</param>
        /// <param name="value">A <see cref="System.Boolean"/> value give the preference.</param>
        internal void SetPreference(string key, bool value)
        {
            additionalPrefs.Add(key, value.ToString().ToLowerInvariant());
        }

        /// <summary>
        /// Appends this set of preferences to the specified set of preferences.
        /// </summary>
        /// <param name="preferencesToAdd">A dictionary containing the preferences to which to
        /// append these values.</param>
        /// <remarks>If the preference already exists in <paramref name="preferencesToAdd"/>, 
        /// the value will be updated.</remarks>
        internal void AppendPreferencesTo(Dictionary<string, string> preferencesToAdd)
        {
            // This allows the user to add additional preferences, or update ones that already
            // exist.
            foreach (string additionalPreference in additionalPrefs.Keys)
            {
                if (preferencesToAdd.ContainsKey(additionalPreference))
                {
                    preferencesToAdd[additionalPreference] = additionalPrefs[additionalPreference];
                }
                else
                {
                    preferencesToAdd.Add(additionalPreference, additionalPrefs[additionalPreference]);
                }
            }
        } 

        private static bool IsWrappedAsString(string value)
        {
            // Assume we a string is stringified (i.e. wrapped in " ") when
            // the first character == " and the last character == "
            return value.StartsWith("\"", StringComparison.OrdinalIgnoreCase) && value.EndsWith("\"", StringComparison.OrdinalIgnoreCase);
        }
        #endregion
    }
}
