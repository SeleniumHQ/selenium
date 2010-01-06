using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    // This is a simple wrapper class to create a RemoteWebDriver that
    // has no parameters in the constructor.
    public class TestInternetExplorerRemoteWebDriver : RemoteWebDriver
    {
        public TestInternetExplorerRemoteWebDriver()
            : base(new Uri("http://127.0.0.1:6000/wd/hub/"), DesiredCapabilities.InternetExplorer())
        {
        }
    }
}
