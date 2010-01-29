using System;
using System.Globalization;
using System.IO;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Manages the extension used by the <see cref="ChromeDriver"/>.
    /// </summary>
    public class ChromeProfile
    {
        private const string ReapProfileProperty = "webdriver.reap_profile";
        private const string FirstRunFileName = "First Run Dev";

        private static Random tempFileGenerator = new Random();

        private string directory = string.Empty;

        /// <summary>
        /// Initializes a new instance of the ChromeProfile class using the given directory. Assumes that the directory
        /// exists and has the required files.
        /// </summary>
        /// <param name="directory">The directory to use.</param>
        public ChromeProfile(string directory)
        {
            this.directory = directory;
        }

        /// <summary>
        /// Initializes a new instance of the ChromeProfile class using the given directory. Assumes that the directory
        /// exists and has the required files.
        /// </summary>
        public ChromeProfile()
            : this(CreateProfileDir())
        {
        }

        /// <summary>
        /// Gets the value of the Profile Directory
        /// </summary>
        public string ProfileDirectory
        {
            get { return directory; }
        }

        private static string CreateProfileDir()
        {
            try
            {
                string profileDir = GenerateProfileDirectoryName();
                if (Directory.Exists(profileDir))
                {
                    Directory.Delete(profileDir, true);
                }

                Directory.CreateDirectory(profileDir);
                string firstRunFile = Path.Combine(profileDir, FirstRunFileName + ".");
                FileStream firstRunFileStream = File.Create(firstRunFile);
                firstRunFileStream.Close();

                // TODO(danielwd): Maybe add Local State file with window_placement
                // System.setProperty(REAP_PROFILE_PROPERTY, "false");
                return profileDir;
            }
            catch (IOException e)
            {
                throw new WebDriverException("Could not create profile directory.", e);
            }
        }

        // TODO(AndreNogueira): Refactor with FirefoxProfile's equivalent
        private static string GenerateProfileDirectoryName()
        {
            string randomNumber = tempFileGenerator.Next().ToString(CultureInfo.InvariantCulture);
            string directoryName = string.Format(CultureInfo.InvariantCulture, "webdriver{0}-chrome.profile", randomNumber);
            string directoryPath = Path.Combine(Path.GetTempPath(), directoryName);
            return directoryPath;
        }
    }
}
