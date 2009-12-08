using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public class XPathLookupException : WebDriverException
    {
        public XPathLookupException()
            : base()
        {
        }

        public XPathLookupException(string message)
            : base(message)
        {
        }
    }
}
