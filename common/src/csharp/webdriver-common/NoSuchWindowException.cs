using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.Serialization;

namespace OpenQA.Selenium
{
    [Serializable]
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

        public NoSuchWindowException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        protected NoSuchWindowException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
