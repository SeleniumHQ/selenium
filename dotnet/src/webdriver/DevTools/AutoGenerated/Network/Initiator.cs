namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Information about the request initiator.
    /// </summary>
    public sealed class Initiator
    {
        /// <summary>
        /// Type of this initiator.
        ///</summary>
        [JsonProperty("type")]
        public string Type
        {
            get;
            set;
        }
        /// <summary>
        /// Initiator JavaScript stack trace, set for Script only.
        ///</summary>
        [JsonProperty("stack", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.StackTrace Stack
        {
            get;
            set;
        }
        /// <summary>
        /// Initiator URL, set for Parser type or for Script type (when script is importing module) or for SignedExchange type.
        ///</summary>
        [JsonProperty("url", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Initiator line number, set for Parser type or for Script type (when script is importing
        /// module) (0-based).
        ///</summary>
        [JsonProperty("lineNumber", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? LineNumber
        {
            get;
            set;
        }
    }
}