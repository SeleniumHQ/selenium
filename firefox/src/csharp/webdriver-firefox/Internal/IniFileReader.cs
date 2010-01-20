using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.IO;
using System.Text;

namespace OpenQA.Selenium.Firefox.Internal
{
    /// <summary>
    /// Parses and reads an INI file.
    /// </summary>
    internal class IniFileReader
    {
        #region Private members
        private Dictionary<string, Dictionary<string, string>> iniFileStore = new Dictionary<string, Dictionary<string, string>>(); 
        #endregion

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="IniFileReader"/> class.
        /// </summary>
        /// <param name="fileName">The full path to the .INI file to be read.</param>
        public IniFileReader(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                throw new ArgumentNullException("fileName", "File name must not be null or empty");
            }

            if (!File.Exists(fileName))
            {
                throw new FileNotFoundException("INI file not found", fileName);
            }

            Dictionary<string, string> section = new Dictionary<string, string>();
            string sectionName = string.Empty;

            string[] iniFileContent = File.ReadAllLines(fileName);
            foreach (string iniFileLine in iniFileContent)
            {
                if (!string.IsNullOrEmpty(iniFileLine.Trim()) && !iniFileLine.StartsWith(";", StringComparison.OrdinalIgnoreCase))
                {
                    if (iniFileLine.StartsWith("[", StringComparison.OrdinalIgnoreCase) && iniFileLine.EndsWith("]", StringComparison.OrdinalIgnoreCase))
                    {
                        if (!string.IsNullOrEmpty(sectionName))
                        {
                            iniFileStore.Add(sectionName, section);
                        }

                        sectionName = iniFileLine.Substring(1, iniFileLine.Length - 2).ToUpperInvariant();
                        section = new Dictionary<string, string>();
                    }
                    else
                    {
                        string[] entryParts = iniFileLine.Split(new char[] { '=' }, 2);
                        string name = entryParts[0].ToUpperInvariant();
                        string value = string.Empty;
                        if (entryParts.Length > 1)
                        {
                            value = entryParts[1];
                        }

                        section.Add(name, value);
                    }
                }
            }

            iniFileStore.Add(sectionName, section);
        } 
        #endregion

        #region Properties
        /// <summary>
        /// Gets a <see cref="ReadOnlyCollection{T}"/> containing the names of the sections in the .INI file.
        /// </summary>
        public ReadOnlyCollection<string> SectionNames
        {
            get
            {
                List<string> keyList = new List<string>(iniFileStore.Keys);
                return new ReadOnlyCollection<string>(keyList);
            }
        } 
        #endregion

        #region Methods
        /// <summary>
        /// Gets a value from the .INI file.
        /// </summary>
        /// <param name="sectionName">The section in which to find the key-value pair.</param>
        /// <param name="valueName">The key of the key-value pair.</param>
        /// <returns>The value associated with the given section and key.</returns>
        public string GetValue(string sectionName, string valueName)
        {
            if (string.IsNullOrEmpty(sectionName))
            {
                throw new ArgumentNullException("sectionName", "Section name cannot be null or empty");
            }

            string lowerCaseSectionName = sectionName.ToUpperInvariant();

            if (string.IsNullOrEmpty(valueName))
            {
                throw new ArgumentNullException("valueName", "Value name cannot be null or empty");
            }

            string lowerCaseValueName = valueName.ToUpperInvariant();

            if (!iniFileStore.ContainsKey(lowerCaseSectionName))
            {
                throw new ArgumentException("Section does not exist: " + sectionName, "sectionName");
            }

            Dictionary<string, string> section = iniFileStore[lowerCaseSectionName];

            if (!section.ContainsKey(lowerCaseValueName))
            {
                throw new ArgumentException("Value does not exist: " + valueName, "valueName");
            }

            return section[lowerCaseValueName];
        }
        #endregion
    }
}
