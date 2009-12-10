using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.Serialization;

namespace OpenQA.Selenium
{
    [Serializable]
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

        public XPathLookupException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        protected XPathLookupException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
