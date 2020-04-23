using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Chrome
{
    public class DevChannelChromeDriver : ChromeDriver
    {
        public DevChannelChromeDriver(ChromeDriverService service)
            : this(service, DefaultOptions)
        {
        }

        public DevChannelChromeDriver(ChromeDriverService service, ChromeOptions options)
            : base(service, options)
        {
        }

        public static ChromeOptions DefaultOptions
        {
            // The below path to the Chrome Developer Channel executable is obviously hard-coded.
            // On non-Windows OSes, and for custom install locations, you will need to add a
            // property to the below options: BinaryLocation = <path to Chrome.exe>
            get { return new ChromeOptions() { BinaryLocation = @"C:\Program Files (x86)\Google\Chrome Dev\Application\chrome.exe", AcceptInsecureCertificates = true }; }
        }
    }
}
