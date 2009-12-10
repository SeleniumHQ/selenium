using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.Serialization;

namespace OpenQA.Selenium
{
    [Serializable]
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

        public ElementNotVisibleException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        protected ElementNotVisibleException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
