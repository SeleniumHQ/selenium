using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.Remote
{
    [SetUpFixture]
    // Outside a namespace to affect the entire assembly
    public class MySetUpClass
    {
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