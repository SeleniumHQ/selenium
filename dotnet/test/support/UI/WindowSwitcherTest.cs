using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System.Threading.Tasks;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.Extensions;

namespace Selenium.WebDriver.Support.Tests.UI;

internal class WindowSwitcherTest : DriverTestFixture
{
    [OneTimeSetUp]
    public async Task RunBeforeAnyTestAsync()
    {
        await EnvironmentManager.Instance.WebServer.StartAsync();
    }

    [OneTimeTearDown]
    public async Task RunAfterAnyTestsAsync()
    {
        EnvironmentManager.Instance.CloseCurrentDriver();
        await EnvironmentManager.Instance.WebServer.StopAsync();
    }

    [Test]
    public void SwitchesToNewWindowAndBack()
    {
        driver.Url = xhtmlTestPage;
        var originalWindowHandle = driver.CurrentWindowHandle;
        var delegateCalled = false;
        var openWindowLink = driver.FindElement(By.LinkText("Open new window"));
        driver.WithWindowOpenedBy(() => openWindowLink.Click())
            .Do(() =>
            {
                delegateCalled = true;
                Assert.Multiple(() =>
                {
                    Assert.That(driver.CurrentWindowHandle, Is.Not.EqualTo(originalWindowHandle));
                    Assert.That(driver.Title, Is.EqualTo("We Arrive Here"));
                });
            });

        Assert.Multiple(() =>
        {
            Assert.That(delegateCalled);
            Assert.That(driver.CurrentWindowHandle, Is.EqualTo(originalWindowHandle));
            Assert.That(driver.Title, Is.EqualTo("XHTML Test Page"));
        });
    }
}
