using NUnit.Framework;
using Selenium.Tests.Environment;

namespace Selenium.Tests
{
    [SetUpFixture]
    public class GlobalSetup
    {
        public GlobalSetup()
        {
        }

        [SetUp]
        public void RunBeforeAnyTest()
        {
            EnvironmentManager.Instance.RemoteServer.Start();
            EnvironmentManager.Instance.GetCurrentSelenium();
        }

        [TearDown]
        public void RunAfterAnyTests()
        {
            EnvironmentManager.Instance.ShutdownSelenium();
            EnvironmentManager.Instance.RemoteServer.Stop();
        }
    }
}