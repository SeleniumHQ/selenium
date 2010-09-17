using System;
using System.Runtime.Serialization;

namespace OpenQA.Selenium.Support.UI
{
    [Serializable]
    public class UnexpectedTagNameException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UnexpectedTagNameException"/> class with
        /// the expected tag name and the actual tag name.
        /// </summary>
        /// <param name="expected">The tag name that was expected.</param>
        /// <param name="actual">The actual tag name of the element.</param>
        public UnexpectedTagNameException(string expected, string actual)
            : base(string.Format("Element should have been {0} but was {1}", expected, actual ))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="UnexpectedTagNameException"/> class.
        /// </summary>
        public UnexpectedTagNameException()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="UnexpectedTagNameException"/> class with 
        /// a specified error message.
        /// </summary>
        /// <param name="message"></param>
        public UnexpectedTagNameException(string message) 
            : base(message)
        {
        }

        
        /// <summary>
        /// Initializes a new instance of the <see cref="UnexpectedTagNameException"/> class with
        /// a specified error message and a reference to the inner exception that is the
        /// cause of this exception.
        /// </summary>
        /// <param name="message">The error message that explains the reason for the exception.</param>
        /// <param name="innerException">The exception that is the cause of the current exception,
        /// or <see langword="null"/> if no inner exception is specified.</param>
        public UnexpectedTagNameException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="UnexpectedTagNameException"/> class with serialized data.
        /// </summary>
        /// <param name="info">The <see cref="SerializationInfo"/> that holds the serialized 
        /// object data about the exception being thrown.</param>
        /// <param name="context">The <see cref="StreamingContext"/> that contains contextual 
        /// information about the source or destination.</param>
        protected UnexpectedTagNameException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }

    }
}
