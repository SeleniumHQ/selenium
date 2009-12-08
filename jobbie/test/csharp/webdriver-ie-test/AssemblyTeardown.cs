using NUnit.Framework;
using OpenQa.Selenium.Environment;

[SetUpFixture]
// Outside a namespace to affect the entire assembly
public class MySetUpClass
{

    [TearDown]
    void RunAfterAnyTests()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
    }
}
