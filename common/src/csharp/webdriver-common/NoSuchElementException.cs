using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.Serialization;

namespace OpenQA.Selenium
{
    [Serializable]
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

        public NoSuchElementException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        protected NoSuchElementException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
