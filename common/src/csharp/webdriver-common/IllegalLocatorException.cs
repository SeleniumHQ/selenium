using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.Serialization;

namespace OpenQA.Selenium
{
    [Serializable]
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

        public IllegalLocatorException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        protected IllegalLocatorException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
