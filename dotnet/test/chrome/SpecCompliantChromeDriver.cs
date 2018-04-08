using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Chrome
{
    public class SpecCompliantChromeDriver : ChromeDriver
    {
        public SpecCompliantChromeDriver(ChromeDriverService service) :
            base(service, new ChromeOptions() { UseSpecCompliantProtocol = true })
        {
        }
    }
}
