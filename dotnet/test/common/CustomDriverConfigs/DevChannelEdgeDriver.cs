using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Edge
{
    public class DevChannelEdgeDriver : EdgeDriver
    {
        private static string servicePath = string.Empty;

        public DevChannelEdgeDriver()
            : this(DefaultService, DefaultOptions)
        {
        }

        public DevChannelEdgeDriver(EdgeDriverService service, EdgeOptions options)
            : base(service, options)
        {
        }

        public static EdgeOptions DefaultOptions
        {
            get {
                return new EdgeOptions()
                {
                    UseChromium = true,
                    BinaryLocation = @"C:\Program Files (x86)\Microsoft\Edge Dev\Application\msedge.exe"
                };
            }
        }

        public static EdgeDriverService DefaultService
        {
            get
            {
                EdgeDriverService service = EdgeDriverService.CreateChromiumService(ServicePath);
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
