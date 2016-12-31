using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.Edge
{
    [SetUpFixture]
    // Outside a namespace to affect the entire assembly
    public class MySetUpClass
    {
        [OneTimeSetUp]
        public void RunBeforeAnyTest()
        {
            EnvironmentManager.Instance.WebServer.Start();
        }

        [OneTimeTearDown]
        public void RunAfterAnyTests()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            EnvironmentManager.Instance.WebServer.Stop();
        }
    }
}
