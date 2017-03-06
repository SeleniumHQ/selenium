using NUnit.Framework;
using System.Threading;
using WebDriver.Edge.Tests;

namespace OpenQA.Selenium.Edge
{
    [TestFixture]
    public class BrowserActionExtensionTest : EdgeDriverTestFixture
    {
        const string BROWSER_ACTION_EXT_PATH = @"\Resources\browser_action_ext";

        [OneTimeSetUp]
        public void Init()
        {
            RemoveSideloadDirectory();
            driver.Quit();
            CreateDriverWithExtension(new string[] { BROWSER_ACTION_EXT_PATH });

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
            Assert.AreEqual(ext.Name, "TestBrowserAction");
        }

        [Test]
        public void ExtensionBrowserActionShouldBeRetrievable()
        {
            var extensions = localDriver.GetBrowserExtensions();
            var ext = extensions[0];
            var actions = ext.GetBrowserExtensionActions();
            Assert.AreEqual(actions.Count, 1);
        }

        // Broken due to https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11142127
        //[Test]
        //public void ExtensionBrowserActionBadgeTextShouldBeRetrievable()
        //{
        //    var extensions = localDriver.GetBrowserExtensions();
        //    var ext = extensions[0];
        //    var actions = ext.GetBrowserExtensionActions();
        //    Assert.AreEqual(actions[0].BadgeText, "Hi");
        //}

        [Test]
        public void ExtensionBrowserActionActionTitleShouldBeRetrievable()
        {
            var extensions = localDriver.GetBrowserExtensions();
            var ext = extensions[0];
            var actions = ext.GetBrowserExtensionActions();
            Assert.AreEqual(actions[0].ActionTitle, "Invoke browserAction");
        }

        [Test]
        public void ExtensionBrowserActionTypeShouldBeRetrievable()
        {
            var extensions = localDriver.GetBrowserExtensions();
            var ext = extensions[0];
            var actions = ext.GetBrowserExtensionActions();
            Assert.AreEqual(actions[0].Type, "browserAction");
        }

        [Test]
        public void ExtensionBrowserActionIconShouldBeRetrievable()
        {
            var extensions = localDriver.GetBrowserExtensions();
            var ext = extensions[0];
            var actions = ext.GetBrowserExtensionActions();
            Assert.AreEqual(actions[0].Icon, SIDELOAD_PATH + BROWSER_ACTION_EXT_PATH + @"\icon-19.png");
        }

        [Test]
        public void InvokingExtensionBrowserActionIconChangesIconPath()
        {
            var extensions = localDriver.GetBrowserExtensions();
            var ext = extensions[0];
            var actions = ext.GetBrowserExtensionActions();
            Thread.Sleep(2000);
            actions[0].TakeAction();
            Thread.Sleep(2000);
            actions = ext.GetBrowserExtensionActions();
            Assert.AreEqual(actions[0].Icon, SIDELOAD_PATH + BROWSER_ACTION_EXT_PATH + @"\icon-19-inv.png");
        }

        // Broken due to https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11613415/
        //[Test]
        //public void InvokingExtensionBrowserActionIconChangesBadgeText()
        //{
        //    var extensions = localDriver.GetBrowserExtensions();
        //    var ext = extensions[0];
        //    var actions = ext.GetBrowserExtensionActions();
        //    Thread.Sleep(2000);
        //    actions[0].TakeAction();
        //    Thread.Sleep(2000);
        //    actions = ext.GetBrowserExtensionActions();
        //    Assert.AreEqual(actions[0].BadgeText, "Hi!");
        //}
    }
}
