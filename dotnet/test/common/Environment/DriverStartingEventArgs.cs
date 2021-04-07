using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Environment
{
    public class DriverStartingEventArgs
    {
        DriverService service;
        DriverOptions options;

        public DriverStartingEventArgs(DriverService service, DriverOptions options)
        {
            this.Service = service;
            this.Options = options;
        }

        public DriverService Service { get => service; set => service = value; }

        public DriverOptions Options { get => options; set => options = value; }
    }
}
