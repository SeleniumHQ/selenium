using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.Serialization;

namespace OpenQA.Selenium
{
    [Serializable]
    public class NoSuchFrameException : WebDriverException
    {
        public NoSuchFrameException()
            : base()
        {
        }

        public NoSuchFrameException(string message)
            : base(message)
        {
        }

        public NoSuchFrameException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        protected NoSuchFrameException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
}
}
