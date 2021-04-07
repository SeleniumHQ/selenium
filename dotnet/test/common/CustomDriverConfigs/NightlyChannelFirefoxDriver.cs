using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox
{
    // This is a simple wrapper class to create a FirefoxDriver that
    // uses the Marionette implementation and has no parameters in the
    // constructor.
    public class NightlyChannelFirefoxDriver : FirefoxDriver
    {
        public NightlyChannelFirefoxDriver(FirefoxDriverService service)
            : this(service, DefaultOptions)
        {
        }

        public NightlyChannelFirefoxDriver(FirefoxDriverService service, FirefoxOptions options)
            : base(service, options)
        {
        }

        public static FirefoxOptions DefaultOptions
        {
            // The below path to the Firefox Nightly Channel executable is obviously hard-coded.
            // On non-Windows OSes, and for custom install locations, you will need to add a
            // property to the below options: BrowserExecutableLocation = <path to Firefox.exe>
            get { return new FirefoxOptions() { BrowserExecutableLocation = @"C:\Program Files\Firefox Nightly\firefox.exe", AcceptInsecureCertificates = true }; }
        }
    }
}
