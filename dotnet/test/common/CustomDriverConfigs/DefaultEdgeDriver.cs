using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Edge
{
    public class DefaultEdgeDriver : EdgeDriver
    {
        public DefaultEdgeDriver()
            : this(DefaultService, new EdgeOptions())
        {
        }

        public DefaultEdgeDriver(EdgeDriverService service, EdgeOptions options)
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
