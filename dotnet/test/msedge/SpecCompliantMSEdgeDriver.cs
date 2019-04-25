using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.MSEdge
{
    public class SpecCompliantMSEdgeDriver : MSEdgeDriver
    {
        public SpecCompliantMSEdgeDriver(MSEdgeDriverService service)
            : this(service, DefaultOptions)
        {
        }

        public SpecCompliantMSEdgeDriver(MSEdgeDriverService service, MSEdgeOptions options)
            : base(service, options)
        {
        }

        public static MSEdgeOptions DefaultOptions
        {
            get { return new MSEdgeOptions() { UseSpecCompliantProtocol = true }; }
        }
    }
}
