using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox
{
    // This is a simple wrapper class to create a FirefoxDriver that
    // uses the Marionette implementation and has no parameters in the
    // constructor.
    public class MarionetteWebDriver : FirefoxDriver
    {
        public MarionetteWebDriver()
            : base(new FirefoxOptions())
        {
        }
    }
}
