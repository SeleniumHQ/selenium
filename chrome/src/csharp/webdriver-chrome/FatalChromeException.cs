using System;
using System.Runtime.Serialization;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Creates a new Chrome Exception
    /// </summary>
    [Serializable]
    public class FatalChromeException : WebDriverException
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="FatalChromeException"/> class
        /// </summary>
        public FatalChromeException()
            : base()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FatalChromeException"/> class
        /// </summary>
        /// <param name="message">Message of the error</param>
        public FatalChromeException(string message)
            : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FatalChromeException"/> class
        /// </summary>
        /// <param name="message">Message of the error</param>
        /// <param name="innerException">The exception that is the cause of the current exception,
        /// or <see langword="null"/> if no inner exception is specified.</param>
        public FatalChromeException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FatalChromeException"/> class with serialized data.
        /// </summary>
        /// <param name="info">The <see cref="SerializationInfo"/> that holds the serialized 
        /// object data about the exception being thrown.</param>
        /// <param name="context">The <see cref="StreamingContext"/> that contains contextual 
        /// information about the source or destination.</param>
        protected FatalChromeException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}
