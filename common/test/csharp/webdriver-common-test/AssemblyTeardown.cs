using NUnit.Framework;
using OpenQA.Selenium.Environment;

[SetUpFixture]
// Outside a namespace to affect the entire assembly
public class AssemblyTeardown
{
    [SetUp]
    void RunBeforeAnyTest()
    {
        EnvironmentManager.Instance.WebServer.Start();
    }

    [TearDown]
    void RunAfterAnyTests()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
        EnvironmentManager.Instance.WebServer.Stop();
    }
}
