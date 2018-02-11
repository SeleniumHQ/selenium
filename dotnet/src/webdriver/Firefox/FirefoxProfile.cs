// <copyright file="FirefoxProfile.cs" company="WebDriver Committers">
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
using System.IO.Compression;
using Newtonsoft.Json;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Provides the ability to edit the preferences associated with a Firefox profile.
    /// </summary>
    public class FirefoxProfile
    {
        private const string ExtensionFileName = "webdriver.xpi";
        private const string ExtensionResourceId = "WebDriver.FirefoxExt.zip";
        private const string UserPreferencesFileName = "user.js";

        private const string WebDriverPortPreferenceName = "webdriver_firefox_port";
        private const string EnableNativeEventsPreferenceName = "webdriver_enable_native_events";
        private const string AcceptUntrustedCertificatesPreferenceName = "webdriver_accept_untrusted_certs";
        private const string AssumeUntrustedCertificateIssuerPreferenceName = "webdriver_assume_untrusted_issuer";
        private int profilePort;
        private string profileDir;
        private string sourceProfileDir;
        private bool enableNativeEvents;
        private bool loadNoFocusLibrary;
        private bool acceptUntrustedCerts;
        private bool assumeUntrustedIssuer;
        private bool deleteSource;
        private bool deleteOnClean = true;
        private Preferences profilePreferences;
        private Dictionary<string, FirefoxExtension> extensions = new Dictionary<string, FirefoxExtension>();

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxProfile"/> class.
        /// </summary>
        public FirefoxProfile()
            : this(null)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxProfile"/> class using a
        /// specific profile directory.
        /// </summary>
        /// <param name="profileDirectory">The directory containing the profile.</param>
        public FirefoxProfile(string profileDirectory)
            : this(profileDirectory, false)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxProfile"/> class using a
        /// specific profile directory.
        /// </summary>
        /// <param name="profileDirectory">The directory containing the profile.</param>
        /// <param name="deleteSourceOnClean">Delete the source directory of the profile upon cleaning.</param>
        public FirefoxProfile(string profileDirectory, bool deleteSourceOnClean)
        {
            this.sourceProfileDir = profileDirectory;
            this.profilePort = FirefoxDriver.DefaultPort;
            this.enableNativeEvents = FirefoxDriver.DefaultEnableNativeEvents;
            this.acceptUntrustedCerts = FirefoxDriver.AcceptUntrustedCertificates;
            this.assumeUntrustedIssuer = FirefoxDriver.AssumeUntrustedCertificateIssuer;
            this.deleteSource = deleteSourceOnClean;
            this.ReadDefaultPreferences();
            this.profilePreferences.AppendPreferences(this.ReadExistingPreferences());
            this.AddWebDriverExtension();
        }

        /// <summary>
        /// Gets or sets the port on which the profile connects to the WebDriver extension.
        /// </summary>
        public int Port
        {
            get { return this.profilePort; }
            set { this.profilePort = value; }
        }

        /// <summary>
        /// Gets the directory containing the profile.
        /// </summary>
        public string ProfileDirectory
        {
            get { return this.profileDir; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to delete this profile after use with
        /// the <see cref="FirefoxDriver"/>.
        /// </summary>
        public bool DeleteAfterUse
        {
            get { return this.deleteOnClean; }
            set { this.deleteOnClean = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether native events are enabled.
        /// </summary>
        public bool EnableNativeEvents
        {
            get { return this.enableNativeEvents; }
            set { this.enableNativeEvents = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to always load the library for allowing Firefox
        /// to execute commands without its window having focus.
        /// </summary>
        /// <remarks>The <see cref="AlwaysLoadNoFocusLibrary"/> property is only used on Linux.</remarks>
        public bool AlwaysLoadNoFocusLibrary
        {
            get { return this.loadNoFocusLibrary; }
            set { this.loadNoFocusLibrary = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether Firefox should accept SSL certificates which have
        /// expired, signed by an unknown authority or are generally untrusted. Set to true
        /// by default.
        /// </summary>
        public bool AcceptUntrustedCertificates
        {
            get { return this.acceptUntrustedCerts; }
            set { this.acceptUntrustedCerts = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether Firefox assume untrusted SSL certificates
        /// come from an untrusted issuer or are self-signed. Set to true by default.
        /// </summary>
        /// <remarks>
        /// <para>
        /// Due to limitations within Firefox, it is easy to find out if a certificate has expired
        /// or does not match the host it was served for, but hard to find out if the issuer of the
        /// certificate is untrusted. By default, it is assumed that the certificates were not
        /// issued from a trusted certificate authority.
        /// </para>
        /// <para>
        /// If you receive an "untrusted site" prompt it Firefox when using a certificate that was
        /// issued by valid issuer, but the certificate has expired or is being served served for
        /// a different host (e.g. production certificate served in a testing environment) set this
        /// to false.
        /// </para>
        /// </remarks>
        public bool AssumeUntrustedCertificateIssuer
        {
            get { return this.assumeUntrustedIssuer; }
            set { this.assumeUntrustedIssuer = value; }
        }

        /// <summary>
        /// Converts a base64-encoded string into a <see cref="FirefoxProfile"/>.
        /// </summary>
        /// <param name="base64">The base64-encoded string containing the profile contents.</param>
        /// <returns>The constructed <see cref="FirefoxProfile"/>.</returns>
        public static FirefoxProfile FromBase64String(string base64)
        {
            string destinationDirectory = FileUtilities.GenerateRandomTempDirectoryName("webdriver.{0}.duplicated");
            byte[] zipContent = Convert.FromBase64String(base64);
            using (MemoryStream zipStream = new MemoryStream(zipContent))
            {
                using (ZipStorer profileZipArchive = ZipStorer.Open(zipStream, FileAccess.Read))
                {
                    List<ZipStorer.ZipFileEntry> entryList = profileZipArchive.ReadCentralDirectory();
                    foreach (ZipStorer.ZipFileEntry entry in entryList)
                    {
                        string fileName = entry.FilenameInZip.Replace('/', Path.DirectorySeparatorChar);
                        string destinationFile = Path.Combine(destinationDirectory, fileName);
                        profileZipArchive.ExtractFile(entry, destinationFile);
                    }
                }
            }

            return new FirefoxProfile(destinationDirectory, true);
        }

        /// <summary>
        /// Adds a Firefox Extension to this profile
        /// </summary>
        /// <param name="extensionToInstall">The path to the new extension</param>
        public void AddExtension(string extensionToInstall)
        {
            this.extensions.Add(Path.GetFileNameWithoutExtension(extensionToInstall), new FirefoxExtension(extensionToInstall));
        }

        /// <summary>
        /// Sets a preference in the profile.
        /// </summary>
        /// <param name="name">The name of the preference to add.</param>
        /// <param name="value">A <see cref="string"/> value to add to the profile.</param>
        public void SetPreference(string name, string value)
        {
            this.profilePreferences.SetPreference(name, value);
        }

        /// <summary>
        /// Sets a preference in the profile.
        /// </summary>
        /// <param name="name">The name of the preference to add.</param>
        /// <param name="value">A <see cref="int"/> value to add to the profile.</param>
        public void SetPreference(string name, int value)
        {
            this.profilePreferences.SetPreference(name, value);
        }

        /// <summary>
        /// Sets a preference in the profile.
        /// </summary>
        /// <param name="name">The name of the preference to add.</param>
        /// <param name="value">A <see cref="bool"/> value to add to the profile.</param>
        public void SetPreference(string name, bool value)
        {
            this.profilePreferences.SetPreference(name, value);
        }

        /// <summary>
        /// Set proxy preferences for this profile.
        /// </summary>
        /// <param name="proxy">The <see cref="Proxy"/> object defining the proxy
        /// preferences for the profile.</param>
        [Obsolete("Use the FirefoxOptions class to set a proxy for Firefox.")]
        public void SetProxyPreferences(Proxy proxy)
        {
            this.InternalSetProxyPreferences(proxy);
        }

        /// <summary>
        /// Writes this in-memory representation of a profile to disk.
        /// </summary>
        public void WriteToDisk()
        {
            this.profileDir = GenerateProfileDirectoryName();
            if (!string.IsNullOrEmpty(this.sourceProfileDir))
            {
                FileUtilities.CopyDirectory(this.sourceProfileDir, this.profileDir);
            }
            else
            {
                Directory.CreateDirectory(this.profileDir);
            }

            this.InstallExtensions();
            this.DeleteLockFiles();
            this.DeleteExtensionsCache();
            this.UpdateUserPreferences();
        }

        /// <summary>
        /// Cleans this Firefox profile.
        /// </summary>
        /// <remarks>If this profile is a named profile that existed prior to
        /// launching Firefox, the <see cref="Clean"/> method removes the WebDriver
        /// Firefox extension. If the profile is an anonymous profile, the profile
        /// is deleted.</remarks>
        public void Clean()
        {
            if (this.deleteOnClean && !string.IsNullOrEmpty(this.profileDir) && Directory.Exists(this.profileDir))
            {
                FileUtilities.DeleteDirectory(this.profileDir);
            }

            if (this.deleteSource && !string.IsNullOrEmpty(this.sourceProfileDir) && Directory.Exists(this.sourceProfileDir))
            {
                FileUtilities.DeleteDirectory(this.sourceProfileDir);
            }
        }

        /// <summary>
        /// Converts the profile into a base64-encoded string.
        /// </summary>
        /// <returns>A base64-encoded string containing the contents of the profile.</returns>
        public string ToBase64String()
        {
            string base64zip = string.Empty;
            this.WriteToDisk();

            using (MemoryStream profileMemoryStream = new MemoryStream())
            {
                using (ZipStorer profileZipArchive = ZipStorer.Create(profileMemoryStream, string.Empty))
                {
                    string[] files = Directory.GetFiles(this.profileDir, "*.*", SearchOption.AllDirectories);
                    foreach (string file in files)
                    {
                        string fileNameInZip = file.Substring(this.profileDir.Length).Replace(Path.DirectorySeparatorChar, '/');
                        profileZipArchive.AddFile(ZipStorer.CompressionMethod.Deflate, file, fileNameInZip, string.Empty);
                    }
                }

                base64zip = Convert.ToBase64String(profileMemoryStream.ToArray());
                this.Clean();
            }

            return base64zip;
        }

        /// <summary>
        /// Adds the WebDriver extension for Firefox to the profile.
        /// </summary>
        internal void AddWebDriverExtension()
        {
            if (!this.extensions.ContainsKey("webdriver"))
            {
                this.extensions.Add("webdriver", new FirefoxExtension(ExtensionFileName, ExtensionResourceId));
            }
        }

        /// <summary>
        /// Internal implementation to set proxy preferences for this profile.
        /// </summary>
        /// <param name="proxy">The <see cref="Proxy"/> object defining the proxy
        /// preferences for the profile.</param>
        internal void InternalSetProxyPreferences(Proxy proxy)
        {
            if (proxy == null)
            {
                throw new ArgumentNullException("proxy", "proxy must not be null");
            }

            if (proxy.Kind == ProxyKind.Unspecified)
            {
                return;
            }

            this.SetPreference("network.proxy.type", (int)proxy.Kind);

            switch (proxy.Kind)
            {
                case ProxyKind.Manual: // By default, assume we're proxying the lot
                    this.SetPreference("network.proxy.no_proxies_on", string.Empty);

                    this.SetManualProxyPreference("ftp", proxy.FtpProxy);
                    this.SetManualProxyPreference("http", proxy.HttpProxy);
                    this.SetManualProxyPreference("ssl", proxy.SslProxy);
                    this.SetManualProxyPreference("socks", proxy.SocksProxy);
                    if (proxy.BypassProxyAddresses != null)
                    {
                        this.SetPreference("network.proxy.no_proxies_on", proxy.BypassProxyAddresses);
                    }

                    break;
                case ProxyKind.ProxyAutoConfigure:
                    this.SetPreference("network.proxy.autoconfig_url", proxy.ProxyAutoConfigUrl);
                    break;
            }
        }

        /// <summary>
        /// Generates a random directory name for the profile.
        /// </summary>
        /// <returns>A random directory name for the profile.</returns>
        private static string GenerateProfileDirectoryName()
        {
            return FileUtilities.GenerateRandomTempDirectoryName("anonymous.{0}.webdriver-profile");
        }

        /// <summary>
        /// Deletes the lock files for a profile.
        /// </summary>
        private void DeleteLockFiles()
        {
            File.Delete(Path.Combine(this.profileDir, ".parentlock"));
            File.Delete(Path.Combine(this.profileDir, "parent.lock"));
        }

        /// <summary>
        /// Installs all extensions in the profile in the directory on disk.
        /// </summary>
        private void InstallExtensions()
        {
            foreach (string extensionKey in this.extensions.Keys)
            {
                this.extensions[extensionKey].Install(this.profileDir);
            }
        }

        /// <summary>
        /// Deletes the cache of extensions for this profile, if the cache exists.
        /// </summary>
        /// <remarks>If the extensions cache does not exist for this profile, the
        /// <see cref="DeleteExtensionsCache"/> method performs no operations, but
        /// succeeds.</remarks>
        private void DeleteExtensionsCache()
        {
            DirectoryInfo ex = new DirectoryInfo(Path.Combine(this.profileDir, "extensions"));
            string cacheFile = Path.Combine(ex.Parent.FullName, "extensions.cache");
            if (File.Exists(cacheFile))
            {
                File.Delete(cacheFile);
            }
        }

        /// <summary>
        /// Writes the user preferences to the profile.
        /// </summary>
        private void UpdateUserPreferences()
        {
            if (this.profilePort == 0)
            {
                throw new WebDriverException("You must set the port to listen on before updating user preferences file");
            }

            string userPrefs = Path.Combine(this.profileDir, UserPreferencesFileName);
            if (File.Exists(userPrefs))
            {
                try
                {
                    File.Delete(userPrefs);
                }
                catch (Exception e)
                {
                    throw new WebDriverException("Cannot delete existing user preferences", e);
                }
            }

            this.profilePreferences.SetPreference(WebDriverPortPreferenceName, this.profilePort);
            this.profilePreferences.SetPreference(EnableNativeEventsPreferenceName, this.enableNativeEvents);
            this.profilePreferences.SetPreference(AcceptUntrustedCertificatesPreferenceName, this.acceptUntrustedCerts);
            this.profilePreferences.SetPreference(AssumeUntrustedCertificateIssuerPreferenceName, this.assumeUntrustedIssuer);

            string homePage = this.profilePreferences.GetPreference("browser.startup.homepage");
            if (!string.IsNullOrEmpty(homePage))
            {
                this.profilePreferences.SetPreference("startup.homepage_welcome_url", string.Empty);
                if (homePage != "about:blank")
                {
                    this.profilePreferences.SetPreference("browser.startup.page", 1);
                }
            }

            this.profilePreferences.WriteToFile(userPrefs);
        }

        private void ReadDefaultPreferences()
        {
            using (Stream defaultPrefsStream = ResourceUtilities.GetResourceStream("webdriver.json", "WebDriver.FirefoxPreferences"))
            {
                using (StreamReader reader = new StreamReader(defaultPrefsStream))
                {
                    string defaultPreferences = reader.ReadToEnd();
                    Dictionary<string, object> deserializedPreferences = JsonConvert.DeserializeObject<Dictionary<string, object>>(defaultPreferences, new ResponseValueJsonConverter());
                    Dictionary<string, object> immutableDefaultPreferences = deserializedPreferences["frozen"] as Dictionary<string, object>;
                    Dictionary<string, object> editableDefaultPreferences = deserializedPreferences["mutable"] as Dictionary<string, object>;
                    this.profilePreferences = new Preferences(immutableDefaultPreferences, editableDefaultPreferences);
                }
            }
        }

        /// <summary>
        /// Reads the existing preferences from the profile.
        /// </summary>
        /// <returns>A <see cref="Dictionary{K, V}"/>containing key-value pairs representing the preferences.</returns>
        /// <remarks>Assumes that we only really care about the preferences, not the comments</remarks>
        private Dictionary<string, string> ReadExistingPreferences()
        {
            Dictionary<string, string> prefs = new Dictionary<string, string>();

            try
            {
                if (!string.IsNullOrEmpty(this.sourceProfileDir))
                {
                    string userPrefs = Path.Combine(this.sourceProfileDir, UserPreferencesFileName);
                    if (File.Exists(userPrefs))
                    {
                        string[] fileLines = File.ReadAllLines(userPrefs);
                        foreach (string line in fileLines)
                        {
                            if (line.StartsWith("user_pref(\"", StringComparison.OrdinalIgnoreCase))
                            {
                                string parsedLine = line.Substring("user_pref(\"".Length);
                                parsedLine = parsedLine.Substring(0, parsedLine.Length - ");".Length);
                                string[] parts = line.Split(new string[] { "," }, StringSplitOptions.None);
                                parts[0] = parts[0].Substring(0, parts[0].Length - 1);
                                prefs.Add(parts[0].Trim(), parts[1].Trim());
                            }
                        }
                    }
                }
            }
            catch (IOException e)
            {
                throw new WebDriverException(string.Empty, e);
            }

            return prefs;
        }

        /// <summary>
        /// Sets a preference for a manually specified proxy.
        /// </summary>
        /// <param name="key">The protocol for which to set the proxy.</param>
        /// <param name="settingString">The setting for the proxy.</param>
        private void SetManualProxyPreference(string key, string settingString)
        {
            if (settingString == null)
            {
                return;
            }

            string[] hostPort = settingString.Split(':');
            this.SetPreference("network.proxy." + key, hostPort[0]);
            if (hostPort.Length > 1)
            {
                this.SetPreference("network.proxy." + key + "_port", int.Parse(hostPort[1], CultureInfo.InvariantCulture));
            }
        }
    }
}
