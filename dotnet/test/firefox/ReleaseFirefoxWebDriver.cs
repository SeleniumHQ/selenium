using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox
{
    // This is a simple wrapper class to create a FirefoxDriver that
    // uses the Marionette implementation and has no parameters in the
    // constructor.
    public class ReleaseFirefoxWebDriver : FirefoxDriver
    {
        public ReleaseFirefoxWebDriver(FirefoxDriverService service)
            : this(service, DefaultOptions)
        {
        }

        public ReleaseFirefoxWebDriver(FirefoxDriverService service, FirefoxOptions options)
            : base(service, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        public static FirefoxOptions DefaultOptions
        {
            get { return new FirefoxOptions() { BrowserExecutableLocation = @"\Program Files\Mozilla Firefox\firefox.exe", AcceptInsecureCertificates = true }; }
        }
    }
}
