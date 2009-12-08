using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public class NoSuchElementException : WebDriverException
    {
        public NoSuchElementException()
            : base()
        {
        }

        public NoSuchElementException(string message)
            : base(message)
        {
        }
    }
}
