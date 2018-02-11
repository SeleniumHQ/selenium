using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox
{
    // This is a simple wrapper class to create a FirefoxDriver that
    // uses the Marionette implementation and has no parameters in the
    // constructor.
    public class ReleaseFirefoxWebDriver : FirefoxDriver
    {
        public ReleaseFirefoxWebDriver(FirefoxDriverService service)
            : base(service, new FirefoxOptions() { BrowserExecutableLocation = @"C:\Program Files\Mozilla Firefox\firefox.exe" }, RemoteWebDriver.DefaultCommandTimeout)
        {
        }
    }
}
