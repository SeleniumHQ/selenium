using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Reflection;
using Ionic.Zip;
using System.Xml;
using System.Xml.XPath;
using System.Globalization;

namespace OpenQA.Selenium.Firefox
{
    public class FirefoxProfile
    {
        private const string ExtensionName = "fxdriver@googlecode.com";
        private const string EmNamespaceUri = "http://www.mozilla.org/2004/em-rdf#";

        private int profilePort;
        private string profileDir;
        private string extensionsDir;
        private string userPrefs;
        private bool enableNativeEvents;
        private bool loadNoFocusLibrary;
        private bool acceptUntrustedCerts;
        private Preferences profileAdditionalPrefs = new Preferences();

        public FirefoxProfile()
            : this(Directory.CreateDirectory(Path.Combine(Path.GetTempPath(), "webdriver.profile")).FullName)
        {
        }

        public FirefoxProfile(string profileDirectory)
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
        }

        public int Port
        {
            get { return profilePort; }
            set { profilePort = value; }
        }

        public string ProfileDirectory
        {
            get { return profileDir; }
        }

        public void AddExtension(bool forceAddition)
        {
            string extensionLocation = Path.Combine(extensionsDir, ExtensionName);
            if (!forceAddition && File.Exists(extensionLocation))
            {
                return;
            }

            Assembly executingAssembly = Assembly.GetExecutingAssembly();
            string currentDirectory = executingAssembly.Location;
            // 
            // If we're shadow copying,. fiddle with 
            // the codebase instead 
            // 
            if (AppDomain.CurrentDomain.ShadowCopyFiles)
            {
                Uri uri = new Uri(executingAssembly.CodeBase);
                currentDirectory = uri.LocalPath;
            }

            InstallExtension(Path.Combine(Path.GetDirectoryName(currentDirectory), "webdriver-extension.zip"));
        }

        private void InstallExtension(string extensionZipPath)
        {
            if (!File.Exists(extensionZipPath))
            {
                throw new ArgumentException("Could not find extension source zip file: " + extensionZipPath, "extensionZipPath");
            }

            string tempFileName = Path.Combine(Path.GetTempPath(), "webdriver");
            if (Directory.Exists(tempFileName))
            {
                Directory.Delete(tempFileName, true);
            }

            Directory.CreateDirectory(tempFileName);
            using (ZipFile extensionZipFile = new ZipFile(extensionZipPath))
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

        private static string ReadIdFromInstallRdf(string root)
        {
            string id = null;
            try
            {
                string installRdf = Path.Combine(root, "install.rdf");
                XmlDocument x = new XmlDocument();
                x.Load(installRdf);
                XmlNamespaceManager m = new XmlNamespaceManager(x.NameTable);
                m.AddNamespace("em", EmNamespaceUri);
                m.AddNamespace("RDF", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
                XmlNode d = x.SelectSingleNode("//em:id", m);

                if (d == null)
                {
                    XmlNode des = x.SelectSingleNode("//RDF:Description", m);
                    XmlAttribute attr = des.Attributes["id", EmNamespaceUri];
                    if (attr == null)
                    {
                        throw new WebDriverException("Cannot locate node containing extension id: " + installRdf);
                    }
                    id = attr.Value;
                }
                else
                {
                    id = d.InnerText;
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

        //Assumes that we only really care about the preferences, not the comments
        private static Dictionary<string, string> ReadExistingPreferences(string userPrefsFilePath)
        {
            Dictionary<string, string> prefs = new Dictionary<string, string>();

            try
            {
                string[] fileLines = File.ReadAllLines(userPrefsFilePath);
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
            catch (IOException e)
            {
                throw new WebDriverException("", e);
            }

            return prefs;
        }

        public void SetPreference(string name, string value)
        {
            profileAdditionalPrefs.SetPreference(name, value);
        }

        public void SetPreference(string name, int value)
        {
            profileAdditionalPrefs.SetPreference(name, value.ToString(CultureInfo.InvariantCulture));
        }

        public void SetPreference(string name, bool value)
        {
            profileAdditionalPrefs.SetPreference(name, value.ToString());
        }

        public void UpdateUserPreferences()
        {
            if (profilePort == 0)
            {
                throw new WebDriverException("You must set the port to listen on before updating user.js");
            }

            Dictionary<string, string> prefs = new Dictionary<string, string>();

            if (File.Exists(userPrefs))
            {
                prefs = ReadExistingPreferences(userPrefs);
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
            prefs.Add("app.update.auto", "false");
            prefs.Add("app.update.enabled", "false");
            prefs.Add("browser.download.manager.showWhenStarting", "false");
            prefs.Add("browser.EULA.override", "true");
            prefs.Add("browser.EULA.3.accepted", "true");
            prefs.Add("browser.link.open_external", "2");
            prefs.Add("browser.link.open_newwindow", "2");
            prefs.Add("browser.safebrowsing.enabled", "false");
            prefs.Add("browser.search.update", "false");
            prefs.Add("browser.sessionstore.resume_from_crash", "false");
            prefs.Add("browser.shell.checkDefaultBrowser", "false");
            prefs.Add("browser.startup.page", "0");
            prefs.Add("browser.tabs.warnOnClose", "false");
            prefs.Add("browser.tabs.warnOnOpen", "false");
            prefs.Add("dom.disable_open_during_load", "false");
            prefs.Add("extensions.update.enabled", "false");
            prefs.Add("extensions.update.notifyUser", "false");
            prefs.Add("security.fileuri.origin_policy", "3");
            prefs.Add("security.fileuri.strict_origin_policy", "false");
            prefs.Add("security.warn_entering_secure", "false");
            prefs.Add("security.warn_submit_insecure", "false");
            prefs.Add("security.warn_entering_secure.show_once", "false");
            prefs.Add("security.warn_entering_weak", "false");
            prefs.Add("security.warn_entering_weak.show_once", "false");
            prefs.Add("security.warn_leaving_secure", "false");
            prefs.Add("security.warn_leaving_secure.show_once", "false");
            prefs.Add("security.warn_viewing_mixed", "false");
            prefs.Add("security.warn_viewing_mixed.show_once", "false");
            prefs.Add("signon.rememberSignons", "false");
            prefs.Add("startup.homepage_welcome_url", "\"about:blank\"");

            // Which port should we listen on?
            prefs.Add("webdriver_firefox_port", profilePort.ToString(CultureInfo.InvariantCulture));

            // Should we use native events?
            prefs.Add("webdriver_enable_native_events", enableNativeEvents.ToString());

            // Should we accept untrusted certificates or not?
            prefs.Add("webdriver_accept_untrusted_certs", acceptUntrustedCerts.ToString());

            // Settings to facilitate debugging the driver
            prefs.Add("javascript.options.showInConsole", "true"); // Logs errors in chrome files to the Error Console.
            prefs.Add("browser.dom.window.dump.enabled", "true");  // Enables the use of the dump() statement

            WriteNewPreferences(prefs);
        }

        public void DeleteExtensionsCacheIfItExists()
        {
            DirectoryInfo ex = new DirectoryInfo(extensionsDir);
            string cacheFile = Path.Combine(ex.Parent.FullName, "extensions.cache");
            if (File.Exists(cacheFile))
            {
                File.Delete(cacheFile);
            }
        }

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

        public bool EnableNativeEvents
        {
            get { return enableNativeEvents; }
            set { enableNativeEvents = value; }
        }

        public bool AlwaysLoadNoFocusLibrary
        {
            get { return loadNoFocusLibrary; }
            set { loadNoFocusLibrary = value; }
        }

        public bool AcceptUntrustedCertificates
        {
            get { return acceptUntrustedCerts; }
            set { acceptUntrustedCerts = value; }
        }

        public bool IsRunning
        {
            get
            {
                string macAndLinuxLockFile = Path.Combine(profileDir, ".parentlock");
                string windowsLockFile = Path.Combine(profileDir, "parent.lock");

                return File.Exists(macAndLinuxLockFile) || File.Exists(windowsLockFile);
            }
        }

        public void Clean()
        {
            Directory.Delete(profileDir, true);
        }
    }
}
