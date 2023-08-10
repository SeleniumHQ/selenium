namespace OpenQA.Selenium.IE
{
    // This is a simple wrapper class to create an InternetExplorerDriver that
    // uses the enables RequireWindowFocus as the default input simplation.
    public class EdgeInternetExplorerModeDriver : InternetExplorerDriver
    {

        public EdgeInternetExplorerModeDriver()
            : base(DefaultOptions)
        {
        }

        // Required for dynamic setting with `EnvironmentManager.Instance.CreateDriverInstance(options)`
        public EdgeInternetExplorerModeDriver(InternetExplorerOptions options)
            : base(options)
        {
        }

        public EdgeInternetExplorerModeDriver(InternetExplorerDriverService service, InternetExplorerOptions options)
            : base(service, options)
        {
        }

        public static InternetExplorerOptions DefaultOptions
        {
            get { return new InternetExplorerOptions() { RequireWindowFocus = true, UsePerProcessProxy = true, AttachToEdgeChrome = true }; }
        }
    }
}
