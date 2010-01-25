using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way to store errors from a repsonse
    /// </summary>
    public class ErrorResponse
    {
        private StackTraceElement[] stackTrace;
        private string localizedMessage;
        private string message;
        private string className;
        private string screenshot;

        /// <summary>
        /// Gets or sets the message in a localized message
        /// </summary>
        [JsonProperty("localizedMessage")]
        public string LocalizedMessage
        {
            get { return localizedMessage; }
            set { localizedMessage = value; }
        }

        /// <summary>
        /// Gets or sets the message from the reponse
        /// </summary>
        [JsonProperty("message")]
        public string Message
        {
            get { return message; }
            set { message = value; }
        }

        /// <summary>
        /// Gets or sets the class name that threw the error
        /// </summary>
        [JsonProperty("class")]
        public string ClassName
        {
            get { return className; }
            set { className = value; }
        }

        /// <summary>
        /// Gets or sets the screenshot of the error
        /// </summary>
        [JsonProperty("screen")]
        public string Screenshot
        {
            // TODO: (JimEvans) Change this to return an Image.
            get { return screenshot; }
            set { screenshot = value; }
        }

        /// <summary>
        /// Gets or sets the stack trace of the error
        /// </summary>
        [JsonProperty("stackTrace")]
        public StackTraceElement[] StackTrace
        {
            get { return stackTrace; }
            set { stackTrace = value; }
        }
    }
}
