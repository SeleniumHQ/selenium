using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.IE
{
    // This is a simple wrapper class to create an InternetExplorerDriver that
    // uses the enables RequireWindowFocus as the default input simplation.
    public class EdgeInternetExplorerModeDriver : InternetExplorerDriver
    {
        private static string servicePath = string.Empty;

        public EdgeInternetExplorerModeDriver(InternetExplorerDriverService service)
            : this(service, DefaultOptions)
        {
        }

        public EdgeInternetExplorerModeDriver(InternetExplorerDriverService service, InternetExplorerOptions options)
            : base(service, options)
        {
        }

        public static string ServicePath
        {
            get { return servicePath; }
            set { servicePath = value; }
        }

        public static InternetExplorerDriverService DefaultService
        {
            get
            {
                InternetExplorerDriverService service;
                if (string.IsNullOrEmpty(servicePath))
                {
                   service = InternetExplorerDriverService.CreateDefaultService();
                }
                else
                {
                    service = InternetExplorerDriverService.CreateDefaultService(servicePath);
                }

                // For debugging purposes, one can uncomment the following lines
                // to generate a log from the driver executable. Please do not
                // commit changes to this file with these lines uncommented.
                // service.LogFile = @"iedriver.log";
                // service.LoggingLevel = InternetExplorerDriverLogLevel.Debug;
                return service;
            }
        }

        public static InternetExplorerOptions DefaultOptions
        {
            get { return new InternetExplorerOptions() { RequireWindowFocus = true, UsePerProcessProxy = true, AttachToEdgeChrome = true, EdgeExecutablePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" }; }
        }
    }
}
