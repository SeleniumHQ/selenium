using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public class StaleElementReferenceException : WebDriverException
    {
        public StaleElementReferenceException()
            : base()
        {
        }

        public StaleElementReferenceException(string message)
            : base(message)
        {
        }
    }
}
