using NUnit.Framework;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.HTML5
{
    [TestFixture]
    public class LocalStorageTest : DriverTestFixture
    {
        ILocalStorage storage = null;

        [SetUp]
        public void SetupMethod()
        {
            driver.Url = simpleTestPage;
            storage = ((RemoteWebDriver)driver).WebStorage.GetLocalStorage();
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void SetGetStorage()
        {
            string key = "a", value = "b";
            storage.SetItem(key, value);
            Assert.AreEqual(value, storage.GetItem(key));
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void ClearStorage()
        {
            string key = "a", value = "b";
            storage.SetItem(key, value);
            storage.Clear();
            Assert.IsNull(storage.GetItem(key));
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void RemoveStorage()
        {
            string key = "a", value = "b";
            storage.SetItem(key, value);
            storage.RemoveItem(key);
            Assert.IsNull(storage.GetItem(key));
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void GetAllStoredKeys()
        {
            string key1 = "a", key2 = "b", key3 = "c", value = "b";
            storage.SetItem(key1, value);
            storage.SetItem(key2, value);
            storage.SetItem(key3, value);
            Assert.IsNotNull(storage.GetItem(key1));
            Assert.IsNotNull(storage.GetItem(key2));
            Assert.IsNotNull(storage.GetItem(key3));
        }

        [Test]
        [IgnoreBrowser(Browser.Android, "Untested feature")]
        public void GetStorageSize()
        {
            string key1 = "a", key2 = "t", key3 = "t", value = "b";
            storage.Clear();

            storage.SetItem(key1, value);
            Assert.AreEqual(1, storage.Size());
            storage.SetItem(key2, value);
            Assert.AreEqual(2, storage.Size());
            storage.SetItem(key3, value);
            Assert.AreEqual(2, storage.Size());
        }
    }
}
