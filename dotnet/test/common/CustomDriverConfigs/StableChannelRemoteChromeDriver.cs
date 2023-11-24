using OpenQA.Selenium.Chrome;
using System;

namespace OpenQA.Selenium.Remote
{
    public class StableChannelRemoteChromeDriver : RemoteWebDriver
    {
        public StableChannelRemoteChromeDriver()
            : base(new Uri("http://127.0.0.1:6000/wd/hub/"), new ChromeOptions())
        {
            this.FileDetector = new LocalFileDetector();
        }
    }
}
