namespace OpenQA.Selenium.Firefox
{
    // This is a simple wrapper class to create a FirefoxDriver that
    // uses the Marionette implementation and has no parameters in the
    // constructor.
    public class LegacyFirefoxWebDriver : FirefoxDriver
    {
        public LegacyFirefoxWebDriver()
            : base(new FirefoxOptions() { UseLegacyImplementation = true })
        {
        }
    }
}
