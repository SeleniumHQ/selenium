using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public class NoSuchWindowException : WebDriverException
    {
        public NoSuchWindowException()
            : base()
        {
        }

        public NoSuchWindowException(string message)
            : base(message)
        {
        }
    }
}
