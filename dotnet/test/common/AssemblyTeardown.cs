using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [SetUpFixture]
    // Outside a namespace to affect the entire assembly
    public class AssemblyTeardown
    {
        public AssemblyTeardown()
        {
        }

        [OneTimeSetUp]
        public void RunBeforeAnyTest()
        {
            EnvironmentManager.Instance.WebServer.Start();
            if (EnvironmentManager.Instance.Browser == Browser.Remote)
            {
                EnvironmentManager.Instance.RemoteServer.Start();
            }
        }

        [OneTimeTearDown]
        public void RunAfterAnyTests()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            EnvironmentManager.Instance.WebServer.Stop();
            if (EnvironmentManager.Instance.Browser == Browser.Remote)
            {
                EnvironmentManager.Instance.RemoteServer.Stop();
            }
        }
    }
}