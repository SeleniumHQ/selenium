using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox
{
    // This is a simple wrapper class to create a FirefoxDriver that
    // uses the Marionette implementation and has no parameters in the
    // constructor.
    public class StableChannelFirefoxDriver : FirefoxDriver
    {
        public StableChannelFirefoxDriver(FirefoxDriverService service)
            : this(service, DefaultOptions)
        {
        }

        public StableChannelFirefoxDriver(FirefoxDriverService service, FirefoxOptions options)
            : base(service, options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        public static FirefoxOptions DefaultOptions
        {
            // If you are running with Firefox installed to a custom location, you will need
            // to add a property to the below options: BrowserExecutableLocation = <path to Firefox.exe>
            get { return new FirefoxOptions() { AcceptInsecureCertificates = true }; }
        }
    }
}
