using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium.Remote
{
    [TestFixture]
    public class RemoteWebDriverSpecificTests : DriverTestFixture
    {
        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldBeAbleToCreateRemoteWebDriverWithNoSlashAtEndOfUri()
        {
            Environment.EnvironmentManager.Instance.CloseCurrentDriver();
            RemoteWebDriver noSlashDriver = new RemoteWebDriver(new Uri("http://127.0.0.1:6000/wd/hub"), DesiredCapabilities.InternetExplorer());
            noSlashDriver.Url = javascriptPage;
            noSlashDriver.Quit();
        }
    }
}
