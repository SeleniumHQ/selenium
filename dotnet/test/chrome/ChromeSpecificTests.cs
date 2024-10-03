using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.Chrome
{
    [TestFixture]
    public class ChromeSpecificTests : DriverTestFixture
    {
        [OneTimeTearDown]
        public void RunAfterAnyTests()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            EnvironmentManager.Instance.WebServer.Stop();
        }
    }
}
