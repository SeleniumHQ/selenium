using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Chrome
{
    public class SpecCompliantChromeDriver : ChromeDriver
    {
        public SpecCompliantChromeDriver(ChromeDriverService service)
            : this(service, DefaultOptions)
        {
        }

        public SpecCompliantChromeDriver(ChromeDriverService service, ChromeOptions options)
            : base(service, options)
        {
        }

        public static ChromeOptions DefaultOptions
        {
            get { return new ChromeOptions() { UseSpecCompliantProtocol = true }; }
        }
    }
}
