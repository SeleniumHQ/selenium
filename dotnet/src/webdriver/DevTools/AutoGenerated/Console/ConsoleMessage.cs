namespace OpenQA.Selenium.DevTools.Console
{
    using Newtonsoft.Json;

    /// <summary>
    /// Console message.
    /// </summary>
    public sealed class ConsoleMessage
    {
        /// <summary>
        /// Message source.
        ///</summary>
        [JsonProperty("source")]
        public string Source
        {
            get;
            set;
        }
        /// <summary>
        /// Message severity.
        ///</summary>
        [JsonProperty("level")]
        public string Level
        {
            get;
            set;
        }
        /// <summary>
        /// Message text.
        ///</summary>
        [JsonProperty("text")]
        public string Text
        {
            get;
            set;
        }
        /// <summary>
        /// URL of the message origin.
        ///</summary>
        [JsonProperty("url", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Line number in the resource that generated this message (1-based).
        ///</summary>
        [JsonProperty("line", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Line
        {
            get;
            set;
        }
        /// <summary>
        /// Column number in the resource that generated this message (1-based).
        ///</summary>
        [JsonProperty("column", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Column
        {
            get;
            set;
        }
    }
}