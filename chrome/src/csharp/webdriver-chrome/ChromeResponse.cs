using System.Globalization;
using Newtonsoft.Json;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Represents the Response coming back from chrome
    /// </summary>
    public class ChromeResponse : Response
    {
        // Status code of -1 indicates value is the ID of a ChromeWebElement
        private int statusCode;

        /// <summary>
        /// Gets or sets the Status code for the Response
        /// </summary>
        [JsonProperty("statusCode")]
        public int StatusCode
        {
            get { return statusCode; }
            set { statusCode = value; }
        }

        /// <summary>
        /// Converts the ChromeResponse to string
        /// </summary>
        /// <returns>String Representation of the class</returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "({0}: {1})", statusCode, Value);
        }
    }
}
