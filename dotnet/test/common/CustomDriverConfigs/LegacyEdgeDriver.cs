using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Edge
{
    public class LegacyEdgeDriver : EdgeDriver
    {
        public LegacyEdgeDriver()
            : this(DefaultService, new EdgeLegacyOptions())
        {
        }

        public LegacyEdgeDriver(EdgeLegacyDriverService service, EdgeLegacyOptions options)
            : base(service, options)
        {
        }

        public static EdgeLegacyDriverService DefaultService
        {
            get
            {
                EdgeLegacyDriverService service = EdgeLegacyDriverService.CreateDefaultService();
                service.UseSpecCompliantProtocol = true;
                return service;
            }
        }
    }
}
