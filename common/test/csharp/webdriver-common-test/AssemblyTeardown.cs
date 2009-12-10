using NUnit.Framework;
using OpenQA.Selenium.Environment;

[SetUpFixture]
// Outside a namespace to affect the entire assembly
public class AssemblyTeardown
{

    [TearDown]
    void RunAfterAnyTests()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
    }
}
