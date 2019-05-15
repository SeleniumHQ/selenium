using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Edge
{
    public class SpecCompliantEdgeDriver : EdgeDriver
    {
        public SpecCompliantEdgeDriver()
            : this(DefaultService, new EdgeOptions())
        {
        }

        public SpecCompliantEdgeDriver(EdgeDriverService service, EdgeOptions options)
            : base(service, options)
        {
        }

        public static EdgeDriverService DefaultService
        {
            get
            {
                EdgeDriverService service = EdgeDriverService.CreateDefaultService();
                service.UseSpecCompliantProtocol = true;
                return service;
            }
        }
    }
}
