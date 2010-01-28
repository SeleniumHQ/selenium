using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using Ionic.Zip;
using System.Reflection;

namespace OpenQA.Selenium.Chrome
{
    internal class ChromeExtension
    {
        /**
         * System property used to specify which extension directory to use.
         */
        private const string CHROME_EXTENSION_DIRECTORY_PROPERTY = "webdriver.chrome.extensiondir";

        private const string DEFAULT_EXTENSION_PATH = "/chrome-extension.zip";
        private const string WINDOWS_MANIFEST_FILE = "manifest-win.json";
        private const string NON_WINDOWS_MANIFEST_FILE = "manifest-nonwin.json";
        private const string MANIFEST_FILE = "manifest.json";

        private static string defaultExtensionDir;

        private string directory;

        /**
         * Create a new instance that manages the extension in the specified
         * directory. Assumes that the directory exists and has the required
         * files.

         * @param directory The directory to use as the Chrome extension.
         * @throws WebDriverException If the directory is not valid (e.g. does not
         *     contain a manifest.json file).
         */
        public ChromeExtension(string directory)
        {
            try
            {
                this.directory = checkExtensionForManifest(directory);
            }
            catch (IOException e)
            {
                throw new WebDriverException(string.Empty, e);
            }
        }

        /**
         * Creates a new instance using the directory specified by the criteria
         * defined by {@link #findChromeExtensionDir()}.
         *
         * @see ChromeExtension(File)
         * @see ChromeExtension#findChromeExtensionDir()
         */
        public ChromeExtension()
            : this(findChromeExtensionDir())
        {
        }

        public string ExtensionDirectory
        {
            get { return directory; }
        }

        /**
         * Searches for the Chrome extension directory to use. Will first check the
         * directory specified by the {@code webdriver.chrome.extensiondir} system
         * property, and then will check the current classpath for
         * {@code chrome-extension.zip}.
         *
         * @return The Chrome extension directory.
         */
        public static string findChromeExtensionDir()
        {
            string directory = defaultExtensionDir;
            if (directory == null)
            {
                directory = defaultExtensionDir;
                if (directory == null)
                {
                    directory = defaultExtensionDir = loadExtension();
                }
            }
            return directory;
        }

        /**
         * Verifies that the given {@code directory} is a valid Chrome extension
         * directory. Will check if the directory has the required
         * {@code manifest.json} file.  If not, it will check for the correct
         * platform manifest and copy it over.
         *
         * @param directory The directory to check.
         * @return The verified directory.
         * @throws IOException If the directory is not valid.
         */
        private static string checkExtensionForManifest(string directory)
        {
            if (!Directory.Exists(directory))
            {
                throw new FileNotFoundException(String.Format(
                    "The specified directory is not a Chrome extension directory: {0}; Try setting {1}",
                    directory, CHROME_EXTENSION_DIRECTORY_PROPERTY));
            }

            string manifestFile = Path.Combine(directory, MANIFEST_FILE);
            if (!File.Exists(manifestFile))
            {
                string platformManifest = Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows)
                    ? WINDOWS_MANIFEST_FILE : NON_WINDOWS_MANIFEST_FILE;

                string platformManifestFile = Path.Combine(directory, platformManifest);
                if (!File.Exists(platformManifestFile))
                {
                    throw new FileNotFoundException(string.Format(
                        "The specified extension has neither a {0} file, nor the platform template, {1}: {2}",
                        MANIFEST_FILE, platformManifestFile, directory));
                }

                File.Copy(platformManifestFile, manifestFile, true);
            }
            return directory;
        }

        private static string loadExtension()
        {
            try
            {
                string extensionDir = string.Empty;
                string directory = string.Empty;
                if (!string.IsNullOrEmpty(directory))
                {
                    extensionDir = directory;
                }
                else
                {
                    Assembly executingAssembly = Assembly.GetExecutingAssembly();
                    string currentDirectory = executingAssembly.Location;

                    // If we're shadow copying,. fiddle with 
                    // the codebase instead 
                    if (AppDomain.CurrentDomain.ShadowCopyFiles)
                    {
                        Uri uri = new Uri(executingAssembly.CodeBase);
                        currentDirectory = uri.LocalPath;
                    }

                    string extensionZipPath = Path.Combine(Path.GetDirectoryName(currentDirectory), "chrome-extension.zip");
                    extensionDir = Path.Combine(Path.GetTempPath(), "webdriver");
                    if (Directory.Exists(extensionDir))
                    {
                        Directory.Delete(extensionDir, true);
                    }

                    Directory.CreateDirectory(extensionDir);
                    Stream zipFileStream = null;
                    if (File.Exists(extensionZipPath))
                    {
                        zipFileStream = new FileStream(extensionZipPath, FileMode.Open, FileAccess.Read);
                    }
                    else
                    {
                        // We're compiled as Any CPU, which will run as a 64-bit process
                        // on 64-bit OS, and 32-bit process on 32-bit OS. Thus, checking
                        // the size of IntPtr is good enough.
                        string resourceName = "WebDriver.ChromeExt.{0}.zip";
                        if (IntPtr.Size == 8)
                        {
                            resourceName = string.Format(resourceName, "x64");
                        }
                        else
                        {
                            resourceName = string.Format(resourceName, "x86");
                        }

                        zipFileStream = executingAssembly.GetManifestResourceStream(resourceName);
                    }
                    using (ZipFile extensionZipFile = ZipFile.Read(zipFileStream))
                    {
                        extensionZipFile.ExtractExistingFile = ExtractExistingFileAction.OverwriteSilently;
                        extensionZipFile.ExtractAll(extensionDir);
                    }
                }
                return checkExtensionForManifest(extensionDir);
            }
            catch (IOException e)
            {
                throw new WebDriverException(string.Empty, e);
            }
        }
    }
}
