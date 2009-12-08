using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public class IllegalLocatorException : WebDriverException
    {
        public IllegalLocatorException()
            : base()
        {
        }

        public IllegalLocatorException(string message)
            : base(message)
        {
        }
    }
}
