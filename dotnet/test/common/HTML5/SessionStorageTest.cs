using NUnit.Framework;

namespace OpenQA.Selenium.Html5
{
    [TestFixture]
	[IgnoreBrowser(Browser.Safari, "Unimplemented feature")]
	public class SessionStorageTest : DriverTestFixture
    {
        IHasWebStorage hasWebStorageDriver;
        ISessionStorage storage = null;

        [SetUp]
        public void SetupMethod()
        {
            driver.Url = html5Page;
            hasWebStorageDriver = driver as IHasWebStorage;
            if (hasWebStorageDriver != null && hasWebStorageDriver.HasWebStorage)
            {
                storage = hasWebStorageDriver.WebStorage.SessionStorage;
            }
        }

        //[Test]
        [IgnoreBrowser(Browser.Firefox, "Firefox driver incorrectly reports capability of web storage")]
        public void SetGetStorage()
        {
            if (storage == null)
            {
                Assert.Ignore("Driver does not support web storage");
            }

            string key = "a", value = "b";
            storage.SetItem(key, value);
            Assert.AreEqual(value, storage.GetItem(key));
        }

        //[Test]
        [IgnoreBrowser(Browser.Firefox, "Firefox driver incorrectly reports capability of web storage")]
        public void ClearStorage()
        {
            if (storage == null)
            {
                Assert.Ignore("Driver does not support web storage");
            }

            string key = "a", value = "b";
            storage.SetItem(key, value);
            storage.Clear();
            Assert.That(storage.GetItem(key), Is.Null);
        }

        //[Test]
        [IgnoreBrowser(Browser.Firefox, "Firefox driver incorrectly reports capability of web storage")]
        public void RemoveStorage()
        {
            if (storage == null)
            {
                Assert.Ignore("Driver does not support web storage");
            }

            string key = "a", value = "b";
            storage.SetItem(key, value);
            storage.RemoveItem(key);
            Assert.That(storage.GetItem(key), Is.Null);
        }

        //[Test]
        [IgnoreBrowser(Browser.Firefox, "Firefox driver incorrectly reports capability of web storage")]
        public void GetAllStoredKeys()
        {
            if (storage == null)
            {
                Assert.Ignore("Driver does not support web storage");
            }

            string key1 = "a", key2 = "b", key3 = "c", value = "b";
            storage.SetItem(key1, value);
            storage.SetItem(key2, value);
            storage.SetItem(key3, value);
            Assert.That(storage.GetItem(key1), Is.Not.Null);
            Assert.That(storage.GetItem(key2), Is.Not.Null);
            Assert.That(storage.GetItem(key3), Is.Not.Null);
        }

        //[Test]
        [IgnoreBrowser(Browser.Firefox, "Firefox driver incorrectly reports capability of web storage")]
        public void GetStorageSize()
        {
            if (storage == null)
            {
                Assert.Ignore("Driver does not support web storage");
            }

            string key1 = "a", key2 = "t", key3 = "t", value = "b";
            storage.Clear();

            storage.SetItem(key1, value);
            Assert.AreEqual(1, storage.Count);
            storage.SetItem(key2, value);
            Assert.AreEqual(2, storage.Count);
            storage.SetItem(key3, value);
            Assert.AreEqual(2, storage.Count);
        }
    }
}
