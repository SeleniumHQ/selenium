using NUnit.Framework;

namespace OpenQA.Selenium.Firefox
{
    [TestFixture]
    public class FirefoxProfileManagerTest
    {
        FirefoxProfileManager manager;

        [SetUp]
        public void SetUp()
        {
            manager = new FirefoxProfileManager();
        }

        //[Test]
        public void ShouldGetNamedProfile()
        {
            FirefoxProfile profile = manager.GetProfile("default");
            Assert.IsNotNull(profile);
        }

        //[Test]
        public void ShouldReturnNullForInvalidProfileName()
        {
            FirefoxProfile profile = manager.GetProfile("ThisIsMyBogusProfileName");
            Assert.IsNull(profile);
        }

        //[Test]
        public void ShouldReturnNullForNullProfileName()
        {
            FirefoxProfile profile = manager.GetProfile(null);
            Assert.IsNull(profile);
        }

        //[Test]
        public void ShouldReturnNullForEmptyProfileName()
        {
            FirefoxProfile profile = manager.GetProfile(string.Empty);
            Assert.IsNull(profile);
        }
    }
}
