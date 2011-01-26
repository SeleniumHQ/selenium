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
        private const string WebDriverDefaultProfileName = "WEBDRIVER_DEFAULT_PROFILE";
        private const string FirstRunFileName = "First Run Dev";

        private static Random tempFileGenerator = new Random();
        private static ChromeProfile defaultChromeProfile = new ChromeProfile(WebDriverDefaultProfileName);

        private string directory = string.Empty;
        private bool deleteProfileOnExit = true;

        private bool acceptUntrustedCerts;

        /// <summary>
        /// Initializes a new instance of the ChromeProfile class using the given directory. Assumes that the directory
        /// exists and has the required files.
        /// </summary>
        /// <param name="directory">The directory to use.</param>
        public ChromeProfile(string directory)
        {
            this.directory = directory;
            this.acceptUntrustedCerts = ChromeDriver.AcceptUntrustedCertificates;
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
        /// Gets an instance of the defualt profile to be used by WebDriver
        /// </summary>
        /// <remarks>
        /// Using the default profile if it currently has windows open will fail, as the extension 
        /// will not be installed.
        /// TODO: This should really create a new profile identical to the default profile.
        /// </remarks>
        public static ChromeProfile DefaultProfile
        {
            get
            {
                // We don't want to delete the user's default profile on exit.
                defaultChromeProfile.DeleteProfileOnExit = false;
                return defaultChromeProfile; 
            }
        }

        /// <summary>
        /// Gets the value of the Profile Directory
        /// </summary>
        public string ProfileDirectory
        {
            get { return this.directory; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to delete this profile when exiting the browser.
        /// </summary>
        public bool DeleteProfileOnExit
        {
            get { return this.deleteProfileOnExit; }
            set { this.deleteProfileOnExit = value; }
        }

        /// <summary>
        /// Gets a value of the UntrustedCertificatesFlag that is used when starting the browser
        /// </summary>
        public string UntrustedCertificatesCommandLineArgument
        {
            get
            {
                return this.acceptUntrustedCerts ? " --ignore-certificate-errors " : string.Empty;
            }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to accept untrusted certificates or not
        /// </summary>
        public bool AcceptUntrustedCertificates
        {
            get
            {
                return this.acceptUntrustedCerts;
            }

            set
            {
                this.acceptUntrustedCerts = value;
            }
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
