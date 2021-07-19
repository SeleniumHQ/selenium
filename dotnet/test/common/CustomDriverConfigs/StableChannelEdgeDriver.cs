using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Edge
{
    public class StableChannelEdgeDriver : EdgeDriver
    {
        private static string servicePath = string.Empty;

        public StableChannelEdgeDriver()
            : this(DefaultService, DefaultOptions)
        {
        }

        public StableChannelEdgeDriver(EdgeDriverService service, EdgeOptions options)
            : base(service, options)
        {
        }

        public static EdgeOptions DefaultOptions
        {
            get {
                // The below path to the Edge Developer Channel executable is obviously hard-coded.
                // On non-Windows OSes, and for custom install locations, you will need to add a
                // property to the below options: BinaryLocation = <path to MSEdge.exe>
                return new EdgeOptions()
                {
                    UseChromium = true,
                    BinaryLocation = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
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
