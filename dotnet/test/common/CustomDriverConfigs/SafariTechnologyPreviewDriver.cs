namespace OpenQA.Selenium.Safari
{
    // This is a simple wrapper class to create a SafariDriver that
    // uses the technology preview implementation and has no parameters in the
    // constructor.
    public class SafariTechnologyPreviewDriver : SafariDriver
    {
        public SafariTechnologyPreviewDriver()
            : base(DefaultOptions)
        {
        }

        // Required for dynamic setting with `EnvironmentManager.Instance.CreateDriverInstance(options)`
        public SafariTechnologyPreviewDriver(SafariOptions options)
            : base(options)
        {
        }

        public static SafariOptions DefaultOptions
        {
            get
            {
                SafariOptions options = new SafariOptions();
                options.UseTechnologyPreview();
                return options;
            }
        }
    }
}
