using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public class NoSuchFrameException : WebDriverException
    {
        public NoSuchFrameException()
            : base()
        {
        }

        public NoSuchFrameException(string message)
            : base(message)
        {
        }
    }
}
