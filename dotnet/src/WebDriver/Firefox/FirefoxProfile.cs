// <copyright file="FirefoxProfile.cs" company="WebDriver Committers">
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
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Text;
using System.Xml;
using System.Xml.XPath;
using Ionic.Zip;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Provides the ability to edit the preferences associated with a Firefox profile.
    /// </summary>
    public class FirefoxProfile
    {
        #region Constants
        private const string ExtensionFileName = "webdriver.xpi";
        private const string ExtensionResourceId = "WebDriver.FirefoxExt.zip";
        private const string UserPreferencesFileName = "user.js";
        #endregion

        #region Private members
        private static Random tempFileGenerator = new Random();

        private int profilePort;
        private string profileDir;
        private string sourceProfileDir;
        private bool enableNativeEvents;
        private bool loadNoFocusLibrary;
        private bool acceptUntrustedCerts;
        private bool deleteSource;
        private Preferences profileAdditionalPrefs = new Preferences();
        private Dictionary<string, FirefoxExtension> extensions = new Dictionary<string, FirefoxExtension>();
        #endregion

        #region Constructors
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
            this.deleteSource = deleteSourceOnClean;
        } 
        #endregion

        #region Properties
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
        /// Gets or sets a value indicating whether Firefox should accept untrusted certificates.
        /// </summary>
        public bool AcceptUntrustedCertificates
        {
            get { return this.acceptUntrustedCerts; }
            set { this.acceptUntrustedCerts = value; }
        }
        #endregion

        #region Public methods
        /// <summary>
        /// Converts a base64-encoded string into a <see cref="FirefoxProfile"/>.
        /// </summary>
        /// <param name="base64">The base64-encoded string containing the profile contents.</param>
        /// <returns>The constructed <see cref="FirefoxProfile"/>.</returns>
        public static FirefoxProfile FromBase64String(string base64)
        {
            string randomNumber = tempFileGenerator.Next().ToString(CultureInfo.InvariantCulture);
            string directoryName = string.Format(CultureInfo.InvariantCulture, "webdriver{0}.duplicated", randomNumber);
            string destinationDirectory = Path.Combine(Path.GetTempPath(), directoryName);
            byte[] zipContent = Convert.FromBase64String(base64);
            using (MemoryStream zipStream = new MemoryStream(zipContent))
            {
                using (ZipFile profileZipArchive = ZipFile.Read(zipStream))
                {
                    profileZipArchive.ExtractExistingFile = ExtractExistingFileAction.OverwriteSilently;
                    profileZipArchive.ExtractAll(destinationDirectory);
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
        /// <param name="value">A <see cref="System.String"/> value to add to the profile.</param>
        public void SetPreference(string name, string value)
        {
            this.profileAdditionalPrefs.SetPreference(name, value);
        }

        /// <summary>
        /// Sets a preference in the profile.
        /// </summary>
        /// <param name="name">The name of the preference to add.</param>
        /// <param name="value">A <see cref="System.Int32"/> value to add to the profile.</param>
        public void SetPreference(string name, int value)
        {
            this.profileAdditionalPrefs.SetPreference(name, value);
        }

        /// <summary>
        /// Sets a preference in the profile.
        /// </summary>
        /// <param name="name">The name of the preference to add.</param>
        /// <param name="value">A <see cref="System.Boolean"/> value to add to the profile.</param>
        public void SetPreference(string name, bool value)
        {
            this.profileAdditionalPrefs.SetPreference(name, value);
        }

        /// <summary>
        /// Set proxy preferences for this profile.
        /// </summary>
        /// <param name="proxy">The <see cref="Proxy"/> object defining the proxy 
        /// preferences for the profile.</param>
        public void SetProxyPreferences(Proxy proxy)
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
                    if (proxy.NoProxy != null)
                    {
                        this.SetPreference("network.proxy.no_proxies_on", proxy.NoProxy);
                    }

                    break;
                case ProxyKind.ProxyAutoConfigure:
                    this.SetPreference("network.proxy.autoconfig_url", proxy.ProxyAutoConfigUrl);
                    break;
            }
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
            if (!string.IsNullOrEmpty(this.profileDir) && Directory.Exists(this.profileDir))
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
            using (ZipFile profileZipFile = new ZipFile())
            {
                profileZipFile.AddDirectory(this.profileDir);
                using (MemoryStream profileMemoryStream = new MemoryStream())
                {
                    profileZipFile.Save(profileMemoryStream);
                    base64zip = Convert.ToBase64String(profileMemoryStream.ToArray());
                }

                this.Clean();
            }

            return base64zip;
        }
        #endregion

        #region Support methods
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
        /// Adds a preference to the profile.
        /// </summary>
        /// <param name="preferences">The preferences dictionary.</param>
        /// <param name="name">The name of the preference.</param>
        /// <param name="value">The value of the preference.</param>
        private static void AddDefaultPreference(Dictionary<string, string> preferences, string name, string value)
        {
            // The user must be able to override the default preferences in the profile,
            // so only add them if they don't already exist.
            if (!preferences.ContainsKey(name))
            {
                preferences.Add(name, value);
            }
        }

        /// <summary>
        /// Generates a random directory name for the profile.
        /// </summary>
        /// <returns>A random directory name for the profile.</returns>
        private static string GenerateProfileDirectoryName()
        {
            string randomNumber = tempFileGenerator.Next().ToString(CultureInfo.InvariantCulture);
            string directoryName = string.Format(CultureInfo.InvariantCulture, "anonymous{0}.webdriver-profile", randomNumber);
            string directoryPath = Path.Combine(Path.GetTempPath(), directoryName);
            return directoryPath;
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
                throw new WebDriverException("You must set the port to listen on before updating user.js");
            }

            Dictionary<string, string> prefs = this.ReadExistingPreferences();

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

            this.profileAdditionalPrefs.AppendPreferencesTo(prefs);

            // Normal settings to facilitate testing
            AddDefaultPreference(prefs, "app.update.auto", "false");
            AddDefaultPreference(prefs, "app.update.enabled", "false");
            AddDefaultPreference(prefs, "browser.download.manager.showWhenStarting", "false");
            AddDefaultPreference(prefs, "browser.EULA.override", "true");
            AddDefaultPreference(prefs, "browser.EULA.3.accepted", "true");
            AddDefaultPreference(prefs, "browser.link.open_external", "2");
            AddDefaultPreference(prefs, "browser.link.open_newwindow", "2");
            AddDefaultPreference(prefs, "browser.offline", "false");
            AddDefaultPreference(prefs, "browser.safebrowsing.enabled", "false");
            AddDefaultPreference(prefs, "browser.safebrowsing.malware.enabled", "false");
            AddDefaultPreference(prefs, "browser.search.update", "false");
            AddDefaultPreference(prefs, "extensions.blocklist.enabled", "false");
            AddDefaultPreference(prefs, "browser.sessionstore.resume_from_crash", "false");
            AddDefaultPreference(prefs, "browser.shell.checkDefaultBrowser", "false");
            AddDefaultPreference(prefs, "browser.startup.page", "0");
            AddDefaultPreference(prefs, "browser.tabs.warnOnClose", "false");
            AddDefaultPreference(prefs, "browser.tabs.warnOnOpen", "false");
            AddDefaultPreference(prefs, "devtools.errorconsole.enabled", "true");
            AddDefaultPreference(prefs, "dom.disable_open_during_load", "false");
            AddDefaultPreference(prefs, "dom.max_script_run_time", "30");
            AddDefaultPreference(prefs, "extensions.autoDisableScopes", "10");
            AddDefaultPreference(prefs, "extensions.logging.enabled", "true");
            AddDefaultPreference(prefs, "extensions.update.enabled", "false");
            AddDefaultPreference(prefs, "extensions.update.notifyUser", "false");
            AddDefaultPreference(prefs, "network.manage-offline-status", "false");
            AddDefaultPreference(prefs, "network.http.max-connections-per-server", "10");
            AddDefaultPreference(prefs, "network.http.phishy-userpass-length", "255");
            AddDefaultPreference(prefs, "offline-apps.allow_by_default", "true");
            AddDefaultPreference(prefs, "prompts.tab_modal.enabled", "false");
            AddDefaultPreference(prefs, "security.fileuri.origin_policy", "3");
            AddDefaultPreference(prefs, "security.fileuri.strict_origin_policy", "false");
            AddDefaultPreference(prefs, "security.warn_entering_secure", "false");
            AddDefaultPreference(prefs, "security.warn_submit_insecure", "false");
            AddDefaultPreference(prefs, "security.warn_entering_secure.show_once", "false");
            AddDefaultPreference(prefs, "security.warn_entering_weak", "false");
            AddDefaultPreference(prefs, "security.warn_entering_weak.show_once", "false");
            AddDefaultPreference(prefs, "security.warn_leaving_secure", "false");
            AddDefaultPreference(prefs, "security.warn_leaving_secure.show_once", "false");
            AddDefaultPreference(prefs, "security.warn_submit_insecure", "false");
            AddDefaultPreference(prefs, "security.warn_viewing_mixed", "false");
            AddDefaultPreference(prefs, "security.warn_viewing_mixed.show_once", "false");
            AddDefaultPreference(prefs, "signon.rememberSignons", "false");
            AddDefaultPreference(prefs, "startup.homepage_welcome_url", "\"about:blank\"");
            AddDefaultPreference(prefs, "toolkit.networkmanager.disable", "true");
            AddDefaultPreference(prefs, "toolkit.telemetry.enabled", "false");
            AddDefaultPreference(prefs, "toolkit.telemetry.prompted", "2");
            AddDefaultPreference(prefs, "toolkit.telemetry.rejected", "true");

            // Which port should we listen on?
            AddDefaultPreference(prefs, "webdriver_firefox_port", this.profilePort.ToString(CultureInfo.InvariantCulture));

            // Should we use native events?
            AddDefaultPreference(prefs, "webdriver_enable_native_events", this.enableNativeEvents.ToString().ToLowerInvariant());

            // Should we accept untrusted certificates or not?
            AddDefaultPreference(prefs, "webdriver_accept_untrusted_certs", this.acceptUntrustedCerts.ToString().ToLowerInvariant());

            // Settings to facilitate debugging the driver
            // Logs errors in chrome files to the Error Console.
            AddDefaultPreference(prefs, "javascript.options.showInConsole", "true"); // Logs errors in chrome files to the Error Console.

            // Enables the use of the dump() statement
            AddDefaultPreference(prefs, "browser.dom.window.dump.enabled", "true");  // Enables the use of the dump() statement

            // Log exceptions from inner frames (i.e. setTimeout)
            AddDefaultPreference(prefs, "dom.report_all_js_exceptions", "true");

            // If the user sets the home page, we should also start up there
            string userHomePage = string.Empty;
            if (prefs.TryGetValue("browser.startup.homepage", out userHomePage))
            {
                AddDefaultPreference(prefs, "startup.homepage_welcome_url", userHomePage);
                if (userHomePage != "about:blank")
                {
                    AddDefaultPreference(prefs, "browser.startup.page", "1");
                }
            }

            this.WriteNewPreferences(prefs);
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
        /// Writes the specified preferences to the user preferences file.
        /// </summary>
        /// <param name="preferences">A <see cref="Dictionary{K, V}"/> containing key-value pairs
        /// representing the preferences to write.</param>
        private void WriteNewPreferences(Dictionary<string, string> preferences)
        {
            using (TextWriter writer = File.CreateText(Path.Combine(this.profileDir, UserPreferencesFileName)))
            {
                foreach (string prefKey in preferences.Keys)
                {
                    writer.WriteLine(string.Format(CultureInfo.InvariantCulture, "user_pref(\"{0}\", {1});", prefKey, preferences[prefKey]));
                }
            }
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
        #endregion
    }
}
