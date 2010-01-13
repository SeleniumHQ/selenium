using System;
using System.Collections.Generic;
using System.Text;
using System.Globalization;

namespace OpenQA.Selenium.Firefox
{
    public class Preferences
    {
        private Dictionary<string, string> additionalPrefs = new Dictionary<string, string>();
        public void SetPreference(string key, string value)
        {
            if (IsWrappedAsString(value))
            {
                throw new ArgumentException(
                    string.Format(CultureInfo.InvariantCulture, "Preference values must be plain strings: {0}: {1}",
                                  key, value));
            }
            additionalPrefs.Add(key, string.Format(CultureInfo.InvariantCulture, "\"{0}\"", value));
        }

        public void AppendPreferencesTo(Dictionary<string, string> preferencesToAdd)
        {
            foreach (string additionalPreference in additionalPrefs.Keys)
            {
                preferencesToAdd.Add(additionalPreference, additionalPrefs[additionalPreference]);
            }
        }

        private static bool IsWrappedAsString(string value)
        {
            // Assume we a string is stringified (i.e. wrapped in " ") when
            // the first character == " and the last character == "
            return value.StartsWith("\"", StringComparison.OrdinalIgnoreCase) && value.EndsWith("\"", StringComparison.OrdinalIgnoreCase);
        }
    }
}
