using System;
using OpenQA.Selenium.Chrome;

namespace OpenQA.Selenium.Remote
{
    // This is a simple wrapper class to create a RemoteWebDriver that
    // has no parameters in the constructor.
    public class ChromeRemoteWebDriver : RemoteWebDriver
    {
        public ChromeRemoteWebDriver()
            : base(new Uri("http://127.0.0.1:6000/wd/hub/"), new ChromeOptions())
        {
        }
    }
}
