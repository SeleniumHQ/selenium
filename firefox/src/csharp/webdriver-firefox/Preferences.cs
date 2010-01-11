using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox
{
    public class Preferences
    {
        private Dictionary<string, string> additionalPrefs = new Dictionary<string, string>();
        public void SetPreference(string key, string value)
        {
            if (IsStringified(value))
            {
                throw new ArgumentException(
                    string.Format("Preference values must be plain strings: {0}: {1}",
                                  key, value));
            }
            additionalPrefs.Add(key, string.Format("\"{0}\"", value));
        }

        public void AppendPreferencesTo(Dictionary<string, string> preferencesToAdd)
        {
            foreach (string additionalPreference in additionalPrefs.Keys)
            {
                preferencesToAdd.Add(additionalPreference, additionalPrefs[additionalPreference]);
            }
        }

        private bool IsStringified(String value)
        {
            // Assume we a string is stringified (i.e. wrapped in " ") when
            // the first character == " and the last character == "
            return value.StartsWith("\"") && value.EndsWith("\"");
        }
    }
}
