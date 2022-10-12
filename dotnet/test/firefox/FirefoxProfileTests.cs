using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using Newtonsoft.Json.Linq;
using NUnit.Framework;

namespace OpenQA.Selenium.Firefox
{
    [TestFixture]
    public class FirefoxProfileTests : DriverTestFixture
    {
        private FirefoxProfile profile;

        [SetUp]
        public void SetUpProfile()
        {
            profile = new FirefoxProfile();
        }

        [TearDown]
        public void CleanProfile()
        {
            profile.Clean();
        }

        [Test]
        public void ShouldGenerateSpecificProfile()
        {
            profile.SetPreference("browser.startup.page", 1);
            profile.SetPreference("browser.startup.homepage", simpleTestPage);

            var firefoxOptions = new FirefoxOptions
            {
                Profile = profile
            };

            driver = new FirefoxDriver(firefoxOptions);
            Assert.AreEqual(simpleTestPage, driver.Url);
            driver.Quit();
        }

        // For some reason .NET is being weird here compared to other bindings; requires more complicated test
        [Test]
        public void ShouldAcceptExistingProfilePath()
        {
            string existingProfilePath = (string)((IHasCapabilities)driver).Capabilities.GetCapability("moz:profile");
            string existingProfileTimes = Path.GetFullPath(existingProfilePath + "/times.json");
            JObject existingTimes = JObject.Parse(File.ReadAllText(existingProfileTimes));

            var newProfileDir = CopyProfile(existingProfilePath);

            driver.Quit();

            var existingProfile = new FirefoxProfile(newProfileDir);
            var firefoxOptions = new FirefoxOptions
            {
                Profile = existingProfile
            };

            driver = new FirefoxDriver(firefoxOptions);
            string currentProfilePath = (string)((IHasCapabilities)driver).Capabilities.GetCapability("moz:profile");
            string currentProfileTimes = Path.GetFullPath(currentProfilePath + "/times.json");
            JObject currentTimes = JObject.Parse(File.ReadAllText(currentProfileTimes));

            Assert.AreEqual(existingTimes, currentTimes);
            driver.Quit();
        }

        [Test]
        public void ShouldQuoteStringsWhenSettingStringProperties()
        {
            profile.SetPreference("cheese", "brie");

            List<string> props = ReadGeneratedProperties();
            bool seenCheese = false;
            foreach (string line in props)
            {
                if (line.Contains("cheese") && line.Contains("\"brie\""))
                {
                    seenCheese = true;
                    break;
                }
            }
            Assert.IsTrue(seenCheese);
        }

        [Test]
        public void ShouldSetIntegerPreferences()
        {
            profile.SetPreference("cheese", 1234);

            List<string> props = ReadGeneratedProperties();
            bool seenCheese = false;
            foreach (string line in props)
            {
                if (line.Contains("cheese") && line.Contains(", 1234)"))
                {
                    seenCheese = true;
                    break;
                }
            }
            Assert.IsTrue(seenCheese, "Did not see integer value being set correctly");
        }

        [Test]
        public void testShouldSetBooleanPreferences()
        {
            profile.SetPreference("cheese", false);

            List<string> props = ReadGeneratedProperties();
            bool seenCheese = false;
            foreach (string line in props)
            {
                if (line.Contains("cheese") && line.Contains(", false)"))
                {
                    seenCheese = true;
                }
            }

            Assert.IsTrue(seenCheese, "Did not see boolean value being set correctly");
        }

        private List<string> ReadGeneratedProperties()
        {
            profile.WriteToDisk();
            List<string> generatedProperties = new List<string>();
            string userPrefs = System.IO.Path.Combine(profile.ProfileDirectory, "user.js");
            if (System.IO.File.Exists(userPrefs))
            {
                string[] fileLines = System.IO.File.ReadAllLines(userPrefs);
                generatedProperties = new List<string>(fileLines);
            }
            return generatedProperties;
        }

        string CopyProfile(string sourceDirectory)
        {
            var destinationDirectory = GenerateRandomTempDirectoryName("anonymous.{0}.webdriver-profile");
            CopyProfileDirectory(sourceDirectory, destinationDirectory);
            return destinationDirectory;
        }

        bool CopyProfileDirectory(string sourceDirectory, string destinationDirectory)
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
                    // Mozilla bug
                    if (!fileEntry.ToString().Contains("user.js"))
                    {
                        try
                        {
                            fileEntry.CopyTo(Path.Combine(destinationDirectoryInfo.FullName, fileEntry.Name));
                        }
                        catch (FileNotFoundException)
                        {
                            // Must not have been important
                        }
                    }
                }

                foreach (DirectoryInfo directoryEntry in sourceDirectoryInfo.GetDirectories())
                {
                    if (!CopyProfileDirectory(directoryEntry.FullName, Path.Combine(destinationDirectoryInfo.FullName, directoryEntry.Name)))
                    {
                        copyComplete = false;
                    }
                }
            }

            copyComplete = true;
            return copyComplete;
        }

        string GenerateRandomTempDirectoryName(string directoryPattern)
        {
            string directoryName = string.Format(CultureInfo.InvariantCulture, directoryPattern, Guid.NewGuid().ToString("N"));
            return Path.Combine(Path.GetTempPath(), directoryName);
        }
    }
}
