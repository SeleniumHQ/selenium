using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Edge
{
    public class ChromiumEdgeDriver : EdgeDriver
    {
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
            get { return new EdgeOptions(false) { UseSpecCompliantProtocol = true }; }
        }

        public static EdgeDriverService DefaultService
        {
            get
            {
                EdgeDriverService service = EdgeDriverService.CreateDefaultService(false);
                return service;
            }
        }
    }
}
