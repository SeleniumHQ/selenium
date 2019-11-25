using System.Collections.Generic;
using NUnit.Framework;

namespace OpenQA.Selenium.Firefox
{
    [TestFixture]
    public class FirefoxProfileTests
    {
        private FirefoxProfile profile;

        [SetUp]
        public void SetUp()
        {
            profile = new FirefoxProfile();
        }

        [TearDown]
        public void TearDown()
        {
            profile.Clean();
        }

        //[Test]
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

        //[Test]
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

        //[Test]
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
    }
}
