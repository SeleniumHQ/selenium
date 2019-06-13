using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Edge
{
    public class ChromiumEdgeDriver : EdgeDriver
    {
        private static string servicePath = string.Empty;

        public ChromiumEdgeDriver()
            : this(DefaultService, DefaultOptions)
        {
        }

        public ChromiumEdgeDriver(EdgeDriverService service, EdgeOptions options)
            : base(service, options)
        {
        }

        public static EdgeOptions DefaultOptions
        {
            get { return new EdgeOptions(false) { BinaryLocation = @"C:\Program Files (x86)\Microsoft\Edge Dev\Application\msedge.exe" }; }
        }

        public static EdgeDriverService DefaultService
        {
            get
            {
                EdgeDriverService service = EdgeDriverService.CreateDefaultService(ServicePath, false);
                return service;
            }
        }

        public static string ServicePath
        {
            get { return servicePath; }
            set { servicePath = value; }
        }
    }
}
