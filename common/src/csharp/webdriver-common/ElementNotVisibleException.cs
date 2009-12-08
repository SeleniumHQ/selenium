using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public class ElementNotVisibleException : WebDriverException
    {
        public ElementNotVisibleException()
            : base()
        {
        }

        public ElementNotVisibleException(string message)
            : base(message)
        {
        }
    }
}
