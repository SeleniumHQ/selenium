namespace OpenQA.Selenium.Safari
{
    // This is a simple wrapper class to create a SafariDriver that
    // uses the technology preview implementation and has no parameters in the
    // constructor.
    public class SafariTechnologyPreviewDriver : SafariDriver
    {
        public SafariTechnologyPreviewDriver()
            : this(DefaultService, DefaultOptions)
        {
        }

        public SafariTechnologyPreviewDriver(SafariDriverService service, SafariOptions options)
            : base(service, options)
        {
        }

        public static SafariDriverService DefaultService
        {
            get { return SafariDriverService.CreateDefaultService("/Applications/Safari Technology Preview.app/Contents/MacOS"); }
        }

        public static SafariOptions DefaultOptions
        {
            get { return new SafariOptions(); }
        }
    }
}
