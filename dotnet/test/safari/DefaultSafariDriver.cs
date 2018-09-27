namespace OpenQA.Selenium.Safari
{
    // This is a simple wrapper class to create a SafariDriver that
    // uses the technology preview implementation and has no parameters in the
    // constructor.
    public class DefaultSafariDriver : SafariDriver
    {
        public DefaultSafariDriver()
            : this(DefaultService, new SafariOptions())
        {
        }

        public DefaultSafariDriver(SafariDriverService service, SafariOptions options)
            : base(service, options)
        {
        }

        public static SafariDriverService DefaultService
        {
            get { return SafariDriverService.CreateDefaultService("/usr/bin"); }
        }
    }
}
