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

        public FirefoxProfile()
            : this(Directory.CreateDirectory(FirefoxProfile.GenerateProfileDirectoryName()).FullName)
        {
        }

        public FirefoxProfile(string profileDirectory)
            : this(profileDirectory, false)
        {
        }

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
            Stream zipFileStream = new FileStream(extensionZipPath, FileMode.Open, FileAccess.Read);
            using (ZipFile extensionZipFile = ZipFile.Read(zipFileStream))
            {
                extensionZipFile.ExtractExistingFile = ExtractExistingFileAction.OverwriteSilently;
                extensionZipFile.ExtractAll(tempFileName);
            }
            //using (ZipFile extensionZipFile = new ZipFile(extensionZipPath))
            //{
            //    extensionZipFile.ExtractExistingFile = ExtractExistingFileAction.OverwriteSilently;
            //    extensionZipFile.ExtractAll(tempFileName);
            //}

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
            profileAdditionalPrefs.SetPreference(name, value);
        }

        public void SetPreference(string name, bool value)
        {
            profileAdditionalPrefs.SetPreference(name, value);
        }

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

        private static void AddDefaultPreference(Dictionary<string, string> preferences, string name, string value)
        {
            // The user must be able to override the default preferences in the profile,
            // so only add them if they don't already exist.
            if (!preferences.ContainsKey(name))
            {
                preferences.Add(name, value);
            }
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

            int numberOfRetries = 0;
            while (Directory.Exists(directoryToDelete) && numberOfRetries < 10)
            {
                try
                {
                    Directory.Delete(directoryToDelete, true);
                }
                catch (IOException ex)
                {
                    // If we hit an exception (like file still in use), wait a half second
                    // and try again. If we still hit an exception, go ahead and let it through.
                    System.Threading.Thread.Sleep(500);
                    Console.WriteLine("Exception found deleting '" + directoryToDelete 
                        + "' on retry " + numberOfRetries + ": " + ex.Message);
                }
                finally
                {
                    numberOfRetries++;
                }
            }
        }

        private static string GenerateProfileDirectoryName()
        {
            string randomNumber = tempFileGenerator.Next().ToString(CultureInfo.InvariantCulture);
            string directoryName = string.Format(CultureInfo.InvariantCulture, "webdriver{0}.profile", randomNumber);
            string directoryPath = Path.Combine(Path.GetTempPath(), directoryName);
            return directoryPath;
        }
    }
}
