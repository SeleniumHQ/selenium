using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Firefox.Internal;

namespace OpenQA.Selenium.Firefox
{
    public class FirefoxProfileManager
    {
        private Dictionary<string, FirefoxProfile> profiles = new Dictionary<string, FirefoxProfile>();

        public FirefoxProfileManager()
        {
            string appDataDirectory = GetApplicationDataDirectory();
            ReadProfiles(appDataDirectory);
        }

        private void ReadProfiles(string appDataDirectory)
        {
            string profilesIniFile = Path.Combine(appDataDirectory, "profiles.ini");
            if (File.Exists(profilesIniFile))
            {
                IniFileReader reader = new IniFileReader(profilesIniFile);
                ReadOnlyCollection<string> sectionNames = reader.SectionNames;
                foreach (string sectionName in sectionNames)
                {
                    if (sectionName.StartsWith("profile", StringComparison.OrdinalIgnoreCase))
                    {
                        string name = reader.GetValue(sectionName, "name");
                        bool isRelative = reader.GetValue(sectionName, "isrelative") == "1";
                        string profilePath = reader.GetValue(sectionName, "path");
                        string fullPath = string.Empty;
                        if (isRelative)
                        {
                            fullPath = Path.Combine(appDataDirectory, profilePath);
                        }
                        else
                        {
                            fullPath = profilePath;
                        }
                        FirefoxProfile profile = new FirefoxProfile(fullPath, true);
                        profiles.Add(name, profile);
                    }
                }
            }
        }

        public FirefoxProfile GetProfile(string profileName)
        {
            FirefoxProfile profile = null;
            if (!string.IsNullOrEmpty(profileName))
            {
                if (profiles.ContainsKey(profileName))
                {
                    profile = profiles[profileName];

                    if (profile.Port == 0)
                    {
                        profile.Port = FirefoxDriver.DefaultPort;
                    }
                }
            }
            return profile;
        }

        public ReadOnlyCollection<FirefoxProfile> ExistingProfiles
        {
            get
            {
                List<FirefoxProfile> profileList = new List<FirefoxProfile>(profiles.Values);
                return new ReadOnlyCollection<FirefoxProfile>(profileList);
            }
        }

        private static string GetApplicationDataDirectory()
        {
            string appDataDirectory = string.Empty;
            switch (Environment.OSVersion.Platform)
            {
                case PlatformID.Unix:
                    appDataDirectory = Path.Combine(".mozilla", "firefox");
                    break;

                case PlatformID.MacOSX:
                    appDataDirectory = Path.Combine("Library", Path.Combine("Application Support", "Firefox"));
                    break;

                default:
                    appDataDirectory = Path.Combine("Mozilla", "Firefox");
                    break;
            }

            return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), appDataDirectory);
        }
    }
}
