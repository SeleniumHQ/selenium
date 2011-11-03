// <copyright file="FirefoxProfileManager.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using System.Collections.ObjectModel;
using System.IO;
using System.Text;
using OpenQA.Selenium.Firefox.Internal;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Allows the user to enumerate and access existing named Firefox profiles.
    /// </summary>
    public class FirefoxProfileManager
    {
        #region Private members
        private Dictionary<string, string> profiles = new Dictionary<string, string>(); 
        #endregion

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxProfileManager"/> class.
        /// </summary>
        public FirefoxProfileManager()
        {
            string appDataDirectory = GetApplicationDataDirectory();
            this.ReadProfiles(appDataDirectory);
        }
        #endregion

        #region Properties
        /// <summary>
        /// Gets a <see cref="ReadOnlyCollection{T}"/> containing <see cref="FirefoxProfile">FirefoxProfiles</see>
        /// representing the existing named profiles for Firefox.
        /// </summary>
        public ReadOnlyCollection<string> ExistingProfiles
        {
            get
            {
                List<string> profileList = new List<string>(this.profiles.Keys);
                return profileList.AsReadOnly();
            }
        } 
        #endregion

        #region Public methods
        /// <summary>
        /// Gets a <see cref="FirefoxProfile"/> with a given name.
        /// </summary>
        /// <param name="profileName">The name of the profile to get.</param>
        /// <returns>A <see cref="FirefoxProfile"/> with a given name.
        /// Returns <see langword="null"/> if no profile with the given name exists.</returns>
        public FirefoxProfile GetProfile(string profileName)
        {
            FirefoxProfile profile = null;
            if (!string.IsNullOrEmpty(profileName))
            {
                if (this.profiles.ContainsKey(profileName))
                {
                    profile = new FirefoxProfile(this.profiles[profileName]);
                    if (profile.Port == 0)
                    {
                        profile.Port = FirefoxDriver.DefaultPort;
                    }
                }
            }

            return profile;
        }

        #endregion

        #region Support methods
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

                        this.profiles.Add(name, fullPath);
                    }
                }
            }
        } 
        #endregion
    }
}
