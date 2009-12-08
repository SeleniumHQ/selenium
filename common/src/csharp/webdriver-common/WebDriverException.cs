using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public class WebDriverException : Exception
    {
        public WebDriverException()
            : base()
        {
        }

        public WebDriverException(string message)
            : base(message)
        {
        }

        public WebDriverException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}
