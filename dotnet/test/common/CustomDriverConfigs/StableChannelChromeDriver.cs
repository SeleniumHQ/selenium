using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Chrome
{
    public class StableChannelChromeDriver : ChromeDriver
    {
        public StableChannelChromeDriver(ChromeDriverService service, ChromeOptions options)
            : base(service, options)
        {
        }

        public static ChromeOptions DefaultOptions
        {
            get { return new ChromeOptions() { AcceptInsecureCertificates = true }; }
        }
    }
}
