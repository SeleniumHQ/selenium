namespace OpenQA.Selenium.Firefox
{
    // This is a simple wrapper class to create a FirefoxDriver that
    // uses the Marionette implementation and has no parameters in the
    // constructor.
    public class NightlyChannelFirefoxDriver : FirefoxDriver
    {
        public NightlyChannelFirefoxDriver()
            : base(DefaultOptions)
        {
        }

        // Required for dynamic setting with `EnvironmentManager.Instance.CreateDriverInstance(options)`
        public NightlyChannelFirefoxDriver(FirefoxOptions options)
            : base(options)
        {
        }

        public static FirefoxOptions DefaultOptions
        {
            get { return new FirefoxOptions() { BrowserVersion = "nightly" }; }
        }
    }
}
