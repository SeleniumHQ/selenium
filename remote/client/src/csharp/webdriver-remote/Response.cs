using System.Globalization;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Handles reponses from the browser
    /// </summary>
    public class Response
    {
        private bool responseIsError;
        private object responseValue;
        private string responseSessionId;
        private string responseContext;

        /// <summary>
        /// Initializes a new instance of the Response class
        /// </summary>
        public Response()
        {
        }

        /// <summary>
        /// Initializes a new instance of the Response class
        /// </summary>
        /// <param name="sessionId">Session ID in use</param>
        /// <param name="context">Context for the current element</param>
        public Response(SessionId sessionId, Context context)
        {
            responseSessionId = sessionId.ToString();
            responseContext = context.ToString();
        }

        /// <summary>
        /// Gets or sets a value indicating whether there is an error
        /// </summary>
        [JsonProperty("error")]
        public bool IsError
        {
            get { return responseIsError; }
            set { responseIsError = value; }
        }

        /// <summary>
        /// Gets or sets the value from JSON
        /// </summary>
        [JsonConverter(typeof(ResponseValueJsonConverter))]
        [JsonProperty("value")]
        public object Value
        {
            get { return responseValue; }
            set { responseValue = value; }
        }

        /// <summary>
        /// Gets or sets the session ID
        /// </summary>
        [JsonProperty("sessionId")]
        public string SessionId
        {
            get { return responseSessionId; }
            set { responseSessionId = value; }
        }

        /// <summary>
        /// Gets or sets the context of the driver
        /// </summary>
        [JsonProperty("context")]
        public string Context
        {
            get { return responseContext; }
            set { responseContext = value; }
        }

        /// <summary>
        /// Returns the object as a string
        /// </summary>
        /// <returns>A string with the Session ID,Context, if there was an error and the value from JSON</returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "({0} {1} {2}: {3})", SessionId, Context, IsError, Value);
        }
    }
}
