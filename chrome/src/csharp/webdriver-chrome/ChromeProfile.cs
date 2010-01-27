using System.IO;
using OpenQA.Selenium;
using System.Globalization;
using System;
//import org.openqa.selenium.WebDriverException;
//import org.openqa.selenium.internal.TemporaryFilesystem;

//import java.io.File;
//import java.io.IOException;

namespace OpenQA.Selenium.Chrome
{

    /**
     * Manages the extension used by the {@link ChromeDriver}.
     *
     * @author jmleyba@google.com (Jason Leyba)
     */
    public class ChromeProfile
    {

        private static String REAP_PROFILE_PROPERTY = "webdriver.reap_profile";
        private static String FIRST_RUN_FILE_NAME = "First Run Dev";

        private static Random tempFileGenerator = new Random();

        private string directory = null;

        /**
         * Create a new profile using the given directory. Assumes that the directory
         * exists and has the required files.
         *
         * @param directory The directory to use.
         */
        public ChromeProfile(string directory)
        {
            this.directory = directory;
        }

        /**
         * Creates a new profile using a temporary directory.
         */
        public ChromeProfile() : this(createProfileDir())
        {
        }

        public string ProfileDirectory {
            get { return directory; }
        }

        ///**
        // * Creates a temporary directory to use as the Chrome profile directory.
        // *
        // * @return File object for the created directory.
        // */
        private static string createProfileDir()
        {
            try
            {
                string profileDir = GenerateProfileDirectoryName();
                if (Directory.Exists(profileDir))
                {
                    Directory.Delete(profileDir, true);
                }
                Directory.CreateDirectory(profileDir);
                string firstRunFile = Path.Combine(profileDir, FIRST_RUN_FILE_NAME + ".");
                FileStream firstRunFileStream = File.Create(firstRunFile);
                firstRunFileStream.Close();
                // TODO(danielwd): Maybe add Local State file with window_placement

                //System.setProperty(REAP_PROFILE_PROPERTY, "false");
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
