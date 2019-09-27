using System;
using OpenQA.Selenium.Firefox;

namespace OpenQA.Selenium.Remote
{
    // This is a simple wrapper class to create a RemoteWebDriver that
    // has no parameters in the constructor.
    public class FirefoxRemoteWebDriver : RemoteWebDriver
    {
        public FirefoxRemoteWebDriver()
            : base(new Uri("http://127.0.0.1:6000/wd/hub/"), new FirefoxOptions())
        {
        }
    }
}
