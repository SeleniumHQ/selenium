using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Edge
{
    public class SpecCompliantEdgeDriver : EdgeDriver
    {
        public SpecCompliantEdgeDriver() :
            base(CreateSpecCompliantEdgeDriverService(), new EdgeOptions())
        {
        }

        private static EdgeDriverService CreateSpecCompliantEdgeDriverService()
        {
            EdgeDriverService service = EdgeDriverService.CreateDefaultService();
            service.UseSpecCompliantProtocol = true;
            return service;
        }
    }
}
