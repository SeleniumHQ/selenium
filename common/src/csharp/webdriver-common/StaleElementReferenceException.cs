using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.Serialization;

namespace OpenQA.Selenium
{
    [Serializable]
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

        public StaleElementReferenceException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        protected StaleElementReferenceException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
