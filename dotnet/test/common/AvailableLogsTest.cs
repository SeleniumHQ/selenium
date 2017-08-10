using NUnit.Framework;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Chrome;

namespace OpenQA.Selenium
{
    [TestFixture]
    [IgnoreBrowser(Browser.IE, "IE driver does not support logs API")]
    [IgnoreBrowser(Browser.Edge, "Edge driver does not support logs API")]
    [IgnoreBrowser(Browser.PhantomJS, "PhantomJS driver does not support logs API")]
	[IgnoreBrowser(Browser.Safari, "Edge driver does not support logs API")]
	public class AvailableLogsTest : DriverTestFixture
    {
        private IWebDriver localDriver;

        [TearDown]
        public void QuitDriver()
        {
            if (localDriver != null)
            {
                localDriver.Quit();
                localDriver = null;
            }
        }

        [Test]
        public void BrowserLogShouldBeEnabledByDefault()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                Assert.Ignore("Marionette does not support logs API.");
            }

            ReadOnlyCollection<string> logTypes = driver.Manage().Logs.AvailableLogTypes;
            Assert.IsTrue(logTypes.Contains(LogType.Browser), "Browser logs should be enabled by default");
        }

        [Test]
        [Ignore("Client log doesn't exist yet in .NET bindings")]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void ClientLogShouldBeEnabledByDefault()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                Assert.Ignore("Marionette does not support logs API.");
            }

            // Do one action to have *something* in the client logs.
            driver.Url = formsPage;
            ReadOnlyCollection<string> logTypes = driver.Manage().Logs.AvailableLogTypes;
            Assert.IsTrue(logTypes.Contains(LogType.Client), "Client logs should be enabled by default");
            bool foundExecutingStatement = false;
            bool foundExecutedStatement = false;
            foreach (LogEntry logEntry in driver.Manage().Logs.GetLog(LogType.Client))
            {
                foundExecutingStatement |= logEntry.ToString().Contains("Executing: ");
                foundExecutedStatement |= logEntry.ToString().Contains("Executed: ");
            }

            Assert.IsTrue(foundExecutingStatement);
            Assert.IsTrue(foundExecutedStatement);
        }

        [Test]
        public void DriverLogShouldBeEnabledByDefault()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                Assert.Ignore("Marionette does not support logs API.");
            }

            ReadOnlyCollection<string> logTypes = driver.Manage().Logs.AvailableLogTypes;
            Assert.IsTrue(logTypes.Contains(LogType.Driver), "Remote driver logs should be enabled by default");
        }

        [Test]
        public void ProfilerLogShouldBeDisabledByDefault()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                Assert.Ignore("Marionette does not support logs API.");
            }

            ReadOnlyCollection<string> logTypes = driver.Manage().Logs.AvailableLogTypes;
            Assert.IsFalse(logTypes.Contains(LogType.Profiler), "Profiler logs should not be enabled by default");
        }

        [Test]
        [IgnoreBrowser(Browser.Safari, "Safari does not support profiler logs")]
        [IgnoreBrowser(Browser.Chrome, "Chrome does not support profiler logs")]
        public void ShouldBeAbleToEnableProfilerLog()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                Assert.Ignore("Marionette does not support logs API.");
            }

            DesiredCapabilities caps = new DesiredCapabilities();
            CreateWebDriverWithProfiling();
            ReadOnlyCollection<string> logTypes = localDriver.Manage().Logs.AvailableLogTypes;
            Assert.IsTrue(logTypes.Contains(LogType.Profiler), "Profiler log should be enabled");
        }

        [Test]
        [Ignore("No way to determine remote only")]
        public void ServerLogShouldBeEnabledByDefaultOnRemote()
        {
            //assumeTrue(Boolean.getBoolean("selenium.browser.remote"));

            ReadOnlyCollection<string> logTypes = localDriver.Manage().Logs.AvailableLogTypes;
            Assert.IsTrue(logTypes.Contains(LogType.Server), "Server logs should be enabled by default");
        }

        private void CreateWebDriverWithProfiling()
        {
            if (TestUtilities.IsFirefox(driver))
            {
                DesiredCapabilities caps = DesiredCapabilities.Firefox();
                caps.SetCapability(CapabilityType.EnableProfiling, true);
                localDriver = new FirefoxDriver(caps);
            }
            else if (TestUtilities.IsChrome(driver))
            {
                ChromeOptions options = new ChromeOptions();
                options.AddAdditionalCapability(CapabilityType.EnableProfiling, true, true);
                localDriver = new ChromeDriver(options);
                ICapabilities c = ((IHasCapabilities)localDriver).Capabilities;
            }
        }
    }
}
