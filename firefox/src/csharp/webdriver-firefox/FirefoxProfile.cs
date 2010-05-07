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
        private const string ExtensionName = "fxdriver@googlecode.com";
        private const string EmNamespaceUri = "http://www.mozilla.org/2004/em-rdf#";
        private const string ExtensionFileName = "webdriver.xpi";
        private const string ExtensionResourceId = "WebDriver.FirefoxExt.zip";
        #endregion

        #region Private members
        private static Random tempFileGenerator = new Random();

        private int profilePort;
        private string profileDir;
        private string extensionsDir;
        private string userPrefs;
        private bool enableNativeEvents;
        private bool loadNoFocusLibrary;
        private bool acceptUntrustedCerts;
        private Preferences profileAdditionalPrefs = new Preferences();
        private bool isNamedProfile; 
        #endregion

        #region Constructors
        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxProfile"/> class.
        /// </summary>
        public FirefoxProfile()
            : this(Directory.CreateDirectory(FirefoxProfile.GenerateProfileDirectoryName()).FullName)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxProfile"/> class using a specific profile directory.
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
        /// <param name="profileIsNamed">A value indicating whether the profile is a named profile.</param>
        internal FirefoxProfile(string profileDirectory, bool profileIsNamed)
        {
            profileDir = profileDirectory;
            extensionsDir = Path.Combine(profileDir, "extensions");
            userPrefs = Path.Combine(profileDir, "user.js");

            profilePort = FirefoxDriver.DefaultPort;
            enableNativeEvents = FirefoxDriver.DefaultEnableNativeEvents;
            acceptUntrustedCerts = FirefoxDriver.AcceptUntrustedCertificates;

            if (!Directory.Exists(profileDir))
            {
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Profile directory does not exist: {0}", profileDir));
            }

            isNamedProfile = profileIsNamed;
        } 
        #endregion

        #region Properties
        /// <summary>
        /// Gets or sets the port on which the profile connects to the WebDriver extension.
        /// </summary>
        public int Port
        {
            get { return profilePort; }
            set { profilePort = value; }
        }

        /// <summary>
        /// Gets the directory containing the profile.
        /// </summary>
        public string ProfileDirectory
        {
            get { return profileDir; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether native events are enabled.
        /// </summary>
        public bool EnableNativeEvents
        {
            get { return enableNativeEvents; }
            set { enableNativeEvents = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to always load the library for allowing Firefox 
        /// to execute commands without its window having focus.
        /// </summary>
        /// <remarks>The <see cref="AlwaysLoadNoFocusLibrary"/> property is only used on Linux.</remarks>
        public bool AlwaysLoadNoFocusLibrary
        {
            get { return loadNoFocusLibrary; }
            set { loadNoFocusLibrary = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether Firefox should accept untrusted certificates.
        /// </summary>
        public bool AcceptUntrustedCertificates
        {
            get { return acceptUntrustedCerts; }
            set { acceptUntrustedCerts = value; }
        }

        /// <summary>
        /// Gets a value indicating whether Firefox is currently running with this profile loaded.
        /// </summary>
        public bool IsRunning
        {
            get
            {
                string macAndLinuxLockFile = Path.Combine(profileDir, ".parentlock");
                string windowsLockFile = Path.Combine(profileDir, "parent.lock");

                return File.Exists(macAndLinuxLockFile) || File.Exists(windowsLockFile);
            }
        } 
        #endregion

        #region Public methods
        /// <summary>
        /// Adds the WebDriver Firefox extension to this profile.
        /// </summary>
        /// <param name="forceAddition"><see langword="true"/> to force the extension to be installed to the
        /// profile, even if the extension is already installed; otherwise, <see langword="false"/></param>
        public void AddExtension(bool forceAddition)
        {
            string extensionLocation = Path.Combine(extensionsDir, ExtensionName);
            if (!forceAddition && File.Exists(extensionLocation))
            {
                return;
            }

            Assembly executingAssembly = Assembly.GetExecutingAssembly();
            string currentDirectory = executingAssembly.Location;

            // If we're shadow copying,. fiddle with 
            // the codebase instead 
            if (AppDomain.CurrentDomain.ShadowCopyFiles)
            {
                Uri uri = new Uri(executingAssembly.CodeBase);
                currentDirectory = uri.LocalPath;
            }

            InstallExtension();
        }

        /// <summary>
        /// Sets a preference in the profile.
        /// </summary>
        /// <param name="name">The name of the preference to add.</param>
        /// <param name="value">A <see cref="System.String"/> value to add to the profile.</param>
        public void SetPreference(string name, string value)
        {
            profileAdditionalPrefs.SetPreference(name, value);
        }

        /// <summary>
        /// Sets a preference in the profile.
        /// </summary>
        /// <param name="name">The name of the preference to add.</param>
        /// <param name="value">A <see cref="System.Int32"/> value to add to the profile.</param>
        public void SetPreference(string name, int value)
        {
            profileAdditionalPrefs.SetPreference(name, value);
        }

        /// <summary>
        /// Sets a preference in the profile.
        /// </summary>
        /// <param name="name">The name of the preference to add.</param>
        /// <param name="value">A <see cref="System.Boolean"/> value to add to the profile.</param>
        public void SetPreference(string name, bool value)
        {
            profileAdditionalPrefs.SetPreference(name, value);
        }

        /// <summary>
        /// Writes the user preferences to the profile.
        /// </summary>
        public void UpdateUserPreferences()
        {
            if (profilePort == 0)
            {
                throw new WebDriverException("You must set the port to listen on before updating user.js");
            }

            Dictionary<string, string> prefs = ReadExistingPreferences();

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

            profileAdditionalPrefs.AppendPreferencesTo(prefs);

            // Normal settings to facilitate testing
            AddDefaultPreference(prefs, "app.update.auto", "false");
            AddDefaultPreference(prefs, "app.update.enabled", "false");
            AddDefaultPreference(prefs, "browser.download.manager.showWhenStarting", "false");
            AddDefaultPreference(prefs, "browser.EULA.override", "true");
            AddDefaultPreference(prefs, "browser.EULA.3.accepted", "true");
            AddDefaultPreference(prefs, "browser.link.open_external", "2");
            AddDefaultPreference(prefs, "browser.link.open_newwindow", "2");
            AddDefaultPreference(prefs, "browser.safebrowsing.enabled", "false");
            AddDefaultPreference(prefs, "browser.search.update", "false");
            AddDefaultPreference(prefs, "browser.sessionstore.resume_from_crash", "false");
            AddDefaultPreference(prefs, "browser.shell.checkDefaultBrowser", "false");
            AddDefaultPreference(prefs, "browser.startup.page", "0");
            AddDefaultPreference(prefs, "browser.tabs.warnOnClose", "false");
            AddDefaultPreference(prefs, "browser.tabs.warnOnOpen", "false");
            AddDefaultPreference(prefs, "dom.disable_open_during_load", "false");
            AddDefaultPreference(prefs, "extensions.update.enabled", "false");
            AddDefaultPreference(prefs, "extensions.update.notifyUser", "false");
            AddDefaultPreference(prefs, "security.fileuri.origin_policy", "3");
            AddDefaultPreference(prefs, "security.fileuri.strict_origin_policy", "false");
            AddDefaultPreference(prefs, "security.warn_entering_secure", "false");
            AddDefaultPreference(prefs, "security.warn_submit_insecure", "false");
            AddDefaultPreference(prefs, "security.warn_entering_secure.show_once", "false");
            AddDefaultPreference(prefs, "security.warn_entering_weak", "false");
            AddDefaultPreference(prefs, "security.warn_entering_weak.show_once", "false");
            AddDefaultPreference(prefs, "security.warn_leaving_secure", "false");
            AddDefaultPreference(prefs, "security.warn_leaving_secure.show_once", "false");
            AddDefaultPreference(prefs, "security.warn_viewing_mixed", "false");
            AddDefaultPreference(prefs, "security.warn_viewing_mixed.show_once", "false");
            AddDefaultPreference(prefs, "signon.rememberSignons", "false");
            AddDefaultPreference(prefs, "startup.homepage_welcome_url", "\"about:blank\"");

            // Which port should we listen on?
            AddDefaultPreference(prefs, "webdriver_firefox_port", profilePort.ToString(CultureInfo.InvariantCulture));

            // Should we use native events?
            AddDefaultPreference(prefs, "webdriver_enable_native_events", enableNativeEvents.ToString().ToLowerInvariant());

            // Should we accept untrusted certificates or not?
            AddDefaultPreference(prefs, "webdriver_accept_untrusted_certs", acceptUntrustedCerts.ToString().ToLowerInvariant());

            // Settings to facilitate debugging the driver
            AddDefaultPreference(prefs, "javascript.options.showInConsole", "true"); // Logs errors in chrome files to the Error Console.
            AddDefaultPreference(prefs, "browser.dom.window.dump.enabled", "true");  // Enables the use of the dump() statement

            WriteNewPreferences(prefs);
        }

        /// <summary>
        /// Deletes the cache of extensions for this profile, if the cache exists.
        /// </summary>
        /// <remarks>If the extensions cache does not exist for this profile, the
        /// <see cref="DeleteExtensionsCache"/> method performs no operations, but 
        /// succeeds.</remarks>
        public void DeleteExtensionsCache()
        {
            DirectoryInfo ex = new DirectoryInfo(extensionsDir);
            string cacheFile = Path.Combine(ex.Parent.FullName, "extensions.cache");
            if (File.Exists(cacheFile))
            {
                File.Delete(cacheFile);
            }
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
            // To clean the profile, if it existed before we start, just 
            // remove the extension. Otherwise, kill the profile.
            string directoryToDelete = string.Empty;
            if (isNamedProfile)
            {
                directoryToDelete = extensionsDir;
            }
            else
            {
                directoryToDelete = profileDir;
            }

            DeleteDirectory(directoryToDelete);
        }
        #endregion

        #region Support methods
        /// <summary>
        /// Writes the specified preferences to the user preferences file.
        /// </summary>
        /// <param name="preferences">A <see cref="Dictionary{K, V}"/> containing key-value pairs
        /// representing the preferences to write.</param>
        protected void WriteNewPreferences(Dictionary<string, string> preferences)
        {
            using (TextWriter writer = File.CreateText(userPrefs))
            {
                foreach (string prefKey in preferences.Keys)
                {
                    writer.WriteLine(string.Format(CultureInfo.InvariantCulture, "user_pref(\"{0}\", {1});", prefKey, preferences[prefKey]));
                }
            }
        }

        private static void AddDefaultPreference(Dictionary<string, string> preferences, string name, string value)
        {
            // The user must be able to override the default preferences in the profile,
            // so only add them if they don't already exist.
            if (!preferences.ContainsKey(name))
            {
                preferences.Add(name, value);
            }
        }

        private static string GenerateProfileDirectoryName()
        {
            string randomNumber = tempFileGenerator.Next().ToString(CultureInfo.InvariantCulture);
            string directoryName = string.Format(CultureInfo.InvariantCulture, "webdriver{0}.profile", randomNumber);
            string directoryPath = Path.Combine(Path.GetTempPath(), directoryName);
            return directoryPath;
        }

        private static void DeleteDirectory(string directoryToDelete)
        {
            int numberOfRetries = 0;
            while (Directory.Exists(directoryToDelete) && numberOfRetries < 10)
            {
                try
                {
                    Directory.Delete(directoryToDelete, true);
                }
                catch (IOException)
                {
                    // If we hit an exception (like file still in use), wait a half second
                    // and try again. If we still hit an exception, go ahead and let it through.
                    System.Threading.Thread.Sleep(500);
                }
                catch (UnauthorizedAccessException)
                {
                    // If we hit an exception (like file still in use), wait a half second
                    // and try again. If we still hit an exception, go ahead and let it through.
                    System.Threading.Thread.Sleep(500);
                }
                finally
                {
                    numberOfRetries++;
                }

                if (Directory.Exists(directoryToDelete))
                {
                    Console.WriteLine("Unable to delete profile directory '{0}'", directoryToDelete);
                }
            }
        } 

        private static string ReadIdFromInstallRdf(string root)
        {
            string id = null;
            try
            {
                string installRdf = Path.Combine(root, "install.rdf");
                XmlDocument rdfXmlDocument = new XmlDocument();
                rdfXmlDocument.Load(installRdf);
                XmlNamespaceManager rdfNamespaceManager = new XmlNamespaceManager(rdfXmlDocument.NameTable);
                rdfNamespaceManager.AddNamespace("em", EmNamespaceUri);
                rdfNamespaceManager.AddNamespace("RDF", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
                XmlNode idNode = rdfXmlDocument.SelectSingleNode("//em:id", rdfNamespaceManager);

                if (idNode == null)
                {
                    XmlNode descriptionNode = rdfXmlDocument.SelectSingleNode("//RDF:Description", rdfNamespaceManager);
                    XmlAttribute idAttribute = descriptionNode.Attributes["id", EmNamespaceUri];
                    if (idAttribute == null)
                    {
                        throw new WebDriverException("Cannot locate node containing extension id: " + installRdf);
                    }

                    id = idAttribute.Value;
                }
                else
                {
                    id = idNode.InnerText;
                }

                if (string.IsNullOrEmpty(id))
                {
                    throw new FileNotFoundException("Cannot install extension with ID: " + id);
                }
            }
            catch (Exception e)
            {
                throw new WebDriverException("Error installing extension", e);
            }

            return id;
        }

        private void InstallExtension()
        {
            string tempFileName = Path.Combine(Path.GetTempPath(), "webdriver");
            if (Directory.Exists(tempFileName))
            {
                Directory.Delete(tempFileName, true);
            }

            Directory.CreateDirectory(tempFileName);
            Stream zipFileStream = ResourceUtilities.GetResourceStream(ExtensionFileName, ExtensionResourceId);
            using (ZipFile extensionZipFile = ZipFile.Read(zipFileStream))
            {
                extensionZipFile.ExtractExistingFile = ExtractExistingFileAction.OverwriteSilently;
                extensionZipFile.ExtractAll(tempFileName);
            }

            string id = ReadIdFromInstallRdf(tempFileName);
            string extensionDirectory = Path.Combine(extensionsDir, id);

            if (Directory.Exists(extensionDirectory))
            {
                Directory.Delete(extensionDirectory, true);
            }

            Directory.CreateDirectory(extensionDirectory);
            CopyDirectory(tempFileName, extensionDirectory);
            Directory.Delete(tempFileName, true);
        }

        private bool CopyDirectory(string sourceDirectory, string destinationDirectory)
        {
            bool copyComplete = false;
            DirectoryInfo sourceDirectoryInfo = new DirectoryInfo(sourceDirectory);
            DirectoryInfo destinationDirectoryInfo = new DirectoryInfo(destinationDirectory);

            if (sourceDirectoryInfo.Exists)
            {
                if (!destinationDirectoryInfo.Exists)
                {
                    destinationDirectoryInfo.Create();
                }

                foreach (FileInfo fileEntry in sourceDirectoryInfo.GetFiles())
                {
                    fileEntry.CopyTo(Path.Combine(destinationDirectoryInfo.FullName, fileEntry.Name));
                }

                foreach (DirectoryInfo directoryEntry in sourceDirectoryInfo.GetDirectories())
                {
                    if (!CopyDirectory(directoryEntry.FullName, Path.Combine(destinationDirectoryInfo.FullName, directoryEntry.Name)))
                    {
                        copyComplete = false;
                    }
                }
            }

            copyComplete = true;
            return copyComplete;
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
            catch (IOException e)
            {
                throw new WebDriverException(string.Empty, e);
            }

            return prefs;
        } 
        #endregion
    }
}
