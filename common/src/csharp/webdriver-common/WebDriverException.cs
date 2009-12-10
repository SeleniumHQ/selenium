using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.Serialization;

namespace OpenQA.Selenium
{
    [Serializable]
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

        protected WebDriverException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
