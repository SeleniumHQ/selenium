using OpenQA.Selenium;
using OpenQA.Selenium.Remote;

namespace WebDriver.Mock.Tests;

public class MockWebDriver: OpenQA.Selenium.WebDriver
{
    public MockWebDriver(string remoteAddress, ICapabilities capabilities)
        : base(new HttpCommandExecutor(new Uri(remoteAddress), TimeSpan.FromSeconds(1)), capabilities)
    {
    }
}
