namespace OpenQA.Selenium.Firefox
{
    // This is a simple wrapper class to create a FirefoxDriver that
    // uses the Marionette implementation and has no parameters in the
    // constructor.
    public class NightlyFirefoxWebDriver : FirefoxDriver
    {
        public NightlyFirefoxWebDriver()
            : base(new FirefoxOptions() { BrowserExecutableLocation = @"C:\Program Files (x86)\Nightly\firefox.exe" })
        {
        }
    }
}
