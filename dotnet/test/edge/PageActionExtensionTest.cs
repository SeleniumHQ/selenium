using NUnit.Framework;
using System.Threading;
using WebDriver.Edge.Tests;

namespace OpenQA.Selenium.Edge
{
    [TestFixture]
    public class PageActionExtensionTest : EdgeDriverTestFixture
    {
        const string PAGE_ACTION_EXT_PATH = @"\Resources\page_action_ext";

        [OneTimeSetUp]
        public void Init()
        {
            RemoveSideloadDirectory();
            driver.Quit();
            CreateDriverWithExtension(new string[] { PAGE_ACTION_EXT_PATH });

            localDriver.Url = "http://www.microsoft.com";

            // Wait for extension initialization (by design because determining when an extension is "ready" depends on the extension)
            Thread.Sleep(5000);
        }

        [OneTimeTearDown]
        public void QuitDriver()
        {
            if (localDriver != null)
            {
                localDriver.Quit();
                localDriver = null;
            }
        }

        [Test]
        public void OneSideloadedExtensionShouldBeRetrievable()
        {
            var extensions = localDriver.GetBrowserExtensions();
            Assert.AreEqual(extensions.Count, 1);
        }

        [Test]
        public void ExtensionNameShouldBeRetrievable()
        {
            var extensions = localDriver.GetBrowserExtensions();
            var ext = extensions[0];
            Assert.AreEqual(ext.Name, "TestPageAction");
        }

        [Test]
        public void ExtensionPageActionShouldBeRetrievable()
        {
            var extensions = localDriver.GetBrowserExtensions();
            var ext = extensions[0];
            var actions = ext.GetBrowserExtensionActions();
            Assert.AreEqual(actions.Count, 1);
        }

        [Test]
        public void ExtensionPageActionActionTitleShouldBeRetrievable()
        {
            var extensions = localDriver.GetBrowserExtensions();
            var ext = extensions[0];
            var actions = ext.GetBrowserExtensionActions();
            Assert.AreEqual(actions[0].ActionTitle, "Invoke pageAction");
        }

        [Test]
        public void ExtensionPageActionTypeShouldBeRetrievable()
        {
            var extensions = localDriver.GetBrowserExtensions();
            var ext = extensions[0];
            var actions = ext.GetBrowserExtensionActions();
            Assert.AreEqual(actions[0].Type, "pageAction");
        }

        [Test]
        public void ExtensionPageActionIconShouldBeRetrievable()
        {
            var extensions = localDriver.GetBrowserExtensions();
            var ext = extensions[0];
            var actions = ext.GetBrowserExtensionActions();
            Assert.AreEqual(actions[0].Icon, SIDELOAD_PATH + PAGE_ACTION_EXT_PATH + @"\icon-19.png");
        }

        // Broken due to https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11613415/
        //[Test]
        //public void InvokingExtensionPageActionIconChangesIconPath()
        //{
        //    var extensions = localDriver.GetBrowserExtensions();
        //    var ext = extensions[0];
        //    var actions = ext.GetBrowserExtensionActions();
        //    Thread.Sleep(2000);
        //    actions[0].TakeAction();
        //    Thread.Sleep(2000);
        //    actions = ext.GetBrowserExtensionActions();
        //    Assert.AreEqual(actions[0].Icon, SIDELOAD_PATH + PAGE_ACTION_EXT_PATH + @"\icon-19-inv.png");
        //}
    }
}
