using NUnit.Framework;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Chrome;

namespace OpenQA.Selenium
{
    [TestFixture]
    [IgnoreBrowser(Browser.Firefox, "Firefox driver (when using Marionette/Geckodriver) does not support logs API")]
    [IgnoreBrowser(Browser.IE, "IE driver does not support logs API")]
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

        //[Test]
        public void BrowserLogShouldBeEnabledByDefault()
        {
            ReadOnlyCollection<string> logTypes = driver.Manage().Logs.AvailableLogTypes;
            Assert.That(logTypes, Contains.Item(LogType.Browser));
        }

        //[Test]
        [Ignore("Client log doesn't exist yet in .NET bindings")]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void ClientLogShouldBeEnabledByDefault()
        {
            // Do one action to have *something* in the client logs.
            driver.Url = formsPage;
            ReadOnlyCollection<string> logTypes = driver.Manage().Logs.AvailableLogTypes;
            Assert.That(logTypes, Contains.Item(LogType.Client));
            bool foundExecutingStatement = false;
            bool foundExecutedStatement = false;
            foreach (LogEntry logEntry in driver.Manage().Logs.GetLog(LogType.Client))
            {
                foundExecutingStatement |= logEntry.ToString().Contains("Executing: ");
                foundExecutedStatement |= logEntry.ToString().Contains("Executed: ");
            }

            Assert.That(foundExecutingStatement, Is.True);
            Assert.That(foundExecutedStatement, Is.True);
        }

        //[Test]
        public void DriverLogShouldBeEnabledByDefault()
        {
            ReadOnlyCollection<string> logTypes = driver.Manage().Logs.AvailableLogTypes;
            Assert.That(logTypes, Contains.Item(LogType.Driver), "Remote driver logs should be enabled by default");
        }

        //[Test]
        public void ProfilerLogShouldBeDisabledByDefault()
        {
            ReadOnlyCollection<string> logTypes = driver.Manage().Logs.AvailableLogTypes;
            Assert.That(logTypes, Has.No.Member(LogType.Profiler), "Profiler logs should not be enabled by default");
        }

        //[Test]
        [IgnoreBrowser(Browser.Chrome, "Chrome does not support profiler logs")]
        [IgnoreBrowser(Browser.Edge, "Edge does not support profiler logs")]
        public void ShouldBeAbleToEnableProfilerLog()
        {
            CreateWebDriverWithProfiling();
            ReadOnlyCollection<string> logTypes = localDriver.Manage().Logs.AvailableLogTypes;
            Assert.That(logTypes, Contains.Item(LogType.Profiler), "Profiler log should be enabled");
        }

        //[Test]
        [Ignore("No way to determine remote only")]
        public void ServerLogShouldBeEnabledByDefaultOnRemote()
        {
            //assumeTrue(Boolean.getBoolean("selenium.browser.remote"));

            ReadOnlyCollection<string> logTypes = localDriver.Manage().Logs.AvailableLogTypes;
            Assert.That(logTypes, Contains.Item(LogType.Server), "Server logs should be enabled by default");
        }

        private void CreateWebDriverWithProfiling()
        {
            if (TestUtilities.IsFirefox(driver))
            {
                FirefoxOptions options = new FirefoxOptions();
                options.AddAdditionalOption(CapabilityType.EnableProfiling, true);
                localDriver = new FirefoxDriver(options);
            }
            else if (TestUtilities.IsChrome(driver))
            {
                ChromeOptions options = new ChromeOptions();
                options.AddAdditionalOption(CapabilityType.EnableProfiling, true);
                localDriver = new ChromeDriver(options);
                ICapabilities c = ((IHasCapabilities)localDriver).Capabilities;
            }
        }
    }
}
