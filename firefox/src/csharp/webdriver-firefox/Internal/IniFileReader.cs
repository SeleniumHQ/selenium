using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Firefox.Internal
{
    internal class IniFileReader
    {
        private Dictionary<string, Dictionary<string, string>> iniFileStore = new Dictionary<string, Dictionary<string, string>>();

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
                if (!string.IsNullOrEmpty(iniFileLine.Trim()) && !iniFileLine.StartsWith(";"))
                {
                    if (iniFileLine.StartsWith("[") && iniFileLine.EndsWith("]"))
                    {
                        if (!string.IsNullOrEmpty(sectionName))
                        {
                            iniFileStore.Add(sectionName, section);
                        }
                        sectionName = iniFileLine.Substring(1, iniFileLine.Length - 2).ToLower();
                        section = new Dictionary<string, string>();
                    }
                    else
                    {
                        string[] entryParts = iniFileLine.Split(new char[] { '=' }, 2);
                        string name = entryParts[0].ToLower();
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

        public ReadOnlyCollection<string> SectionNames
        {
            get
            {
                List<string> keyList = new List<string>(iniFileStore.Keys);
                return new ReadOnlyCollection<string>(keyList); 
            }
        }

        public string GetValue(string sectionName, string valueName)
        {
            if (string.IsNullOrEmpty(sectionName))
            {
                throw new ArgumentNullException("sectionName", "Section name cannot be null or empty");
            }

            string lowerCaseSectionName = sectionName.ToLower();

            if (string.IsNullOrEmpty(valueName))
            {
                throw new ArgumentNullException("valueName", "Value name cannot be null or empty");
            }

            string lowerCaseValueName = valueName.ToLower();

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
    }
}
