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
        }

        [TearDown]
        public void RunAfterAnyTests()
        {
            EnvironmentManager.Instance.RemoteServer.Stop();
        }
    }
}