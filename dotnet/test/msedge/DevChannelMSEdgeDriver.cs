using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.MSEdge
{
    public class DevChannelMSEdgeDriver : MSEdgeDriver
    {
        public DevChannelMSEdgeDriver(MSEdgeDriverService service)
            : this(service, DefaultOptions)
        {
        }

        public DevChannelMSEdgeDriver(MSEdgeDriverService service, MSEdgeOptions options)
            : base(service, options)
        {
        }

        public static MSEdgeOptions DefaultOptions
        {
            get { return new MSEdgeOptions() { BinaryLocation = @"C:\Program Files (x86)\Google\Chrome Dev\Application\chrome.exe" }; }
        }
    }
}
