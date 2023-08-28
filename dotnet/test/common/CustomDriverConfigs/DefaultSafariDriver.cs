namespace OpenQA.Selenium.Safari
{
    // This is a simple wrapper class to create a SafariDriver that
    // uses the technology preview implementation and has no parameters in the
    // constructor.
    public class DefaultSafariDriver : SafariDriver
    {
        // Required for dynamic setting with `EnvironmentManager.Instance.CreateDriverInstance(options)`
        public DefaultSafariDriver(SafariOptions options)
            : base(options)
        {
        }

        public DefaultSafariDriver(SafariDriverService service, SafariOptions options)
            : base(service, options)
        {
        }
    }
}
