using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox
{
    // This is a simple wrapper class to create a FirefoxDriver that
    // uses the Marionette implementation and has no parameters in the
    // constructor.
    public class StableChannelFirefoxDriver : FirefoxDriver
    {
        public StableChannelFirefoxDriver()
            : base(DefaultOptions)
        {
        }

        // Required for dynamic setting with `EnvironmentManager.Instance.CreateDriverInstance(options)`
        public StableChannelFirefoxDriver(FirefoxOptions options)
            : base(options)
        {
        }

        public static FirefoxOptions DefaultOptions
        {
            get { return new FirefoxOptions() { AcceptInsecureCertificates = true }; }
        }
    }
}
