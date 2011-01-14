using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.IE
{
    [SetUpFixture]
    // Outside a namespace to affect the entire assembly
    public class MySetUpClass
    {
        [SetUp]
        public void RunBeforeAnyTest()
        {
            EnvironmentManager.Instance.WebServer.Start();
        }

        [TearDown]
        public void RunAfterAnyTests()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            EnvironmentManager.Instance.WebServer.Stop();
        }
    }
}
