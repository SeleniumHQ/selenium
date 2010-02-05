using System;
using System.IO;
using System.Reflection;
using Ionic.Zip;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Provides a mechanism to Add the WebDriver Extension
    /// </summary>
    internal class ChromeExtension
    {
        // System property used to specify which extension directory to use.
        private const string ChromeExtensionDirectoryProperty = "webdriver.chrome.extensiondir";
        private const string DefaultExtensionPath = "/chrome-extension.zip";
        private const string WindowsManifestFile = "manifest-win.json";
        private const string NonWindowsManifestFile = "manifest-nonwin.json";
        private const string ManifestFile = "manifest.json";

        private static string defaultExtensionDir;
        private string directory;

        /// <summary>
        /// Initializes a new instance of the ChromeExtension class. Assumes that the directory exists and has the required
        /// </summary>
        /// <param name="directory">The directory to use as the Chrome extension.</param>
        public ChromeExtension(string directory)
        {
            try
            {
                this.directory = CheckExtensionForManifest(directory);
            }
            catch (IOException e)
            {
                throw new WebDriverException(string.Empty, e);
            }
        }

        /// <summary>
        /// Initializes a new instance of the ChromeExtension class. Assumes that the directory exists and has the required
        /// </summary>
        public ChromeExtension()
            : this(FindChromeExtensionDir())
        {
        }

        /// <summary>
        /// Gets the Extension Directory
        /// </summary>
        public string ExtensionDirectory
        {
            get { return directory; }
        }

        /// <summary>
        /// Searches for the Chrome extension directory to use. Will first check the
        /// directory specified by the {@code webdriver.chrome.extensiondir} system
        /// property, and then will check the current classpath for  {@code chrome-extension.zip}.
        /// </summary>
        /// <returns>The Chrome extension directory.</returns>
        public static string FindChromeExtensionDir()
        {
            string directory = defaultExtensionDir;
            if (directory == null)
            {
                directory = defaultExtensionDir;
                if (directory == null)
                {
                    directory = defaultExtensionDir = LoadExtension();
                }
            }

            return directory;
        }

        /// <summary>
        /// Verifies that the given {@code directory} is a valid Chrome extension
        /// directory. Will check if the directory has the required
        /// {@code manifest.json} file.  If not, it will check for the correct
        /// platform manifest and copy it over.     
        /// </summary>
        /// <param name="directory">The directory to check.</param>
        /// <returns>The verified directory.</returns>
        /// <exception cref="IOException">If the directory is not valid.</exception>
        private static string CheckExtensionForManifest(string directory)
        {
            if (!Directory.Exists(directory))
            {
                throw new FileNotFoundException(String.Format("The specified directory is not a Chrome extension directory: {0}; Try setting {1}", directory, ChromeExtensionDirectoryProperty));
            }

            string manifestFile = Path.Combine(directory, ManifestFile);
            if (!File.Exists(manifestFile))
            {
                string platformManifest = Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows) ? WindowsManifestFile : NonWindowsManifestFile;

                string platformManifestFile = Path.Combine(directory, platformManifest);
                if (!File.Exists(platformManifestFile))
                {
                    throw new FileNotFoundException(string.Format("The specified extension has neither a {0} file, nor the platform template, {1}: {2}", ManifestFile, platformManifestFile, directory));
                }

                File.Copy(platformManifestFile, manifestFile, true);
            }

            return directory;
        }

        private static string LoadExtension()
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

                return CheckExtensionForManifest(extensionDir);
            }
            catch (IOException e)
            {
                throw new WebDriverException(string.Empty, e);
            }
        }
    }
}
