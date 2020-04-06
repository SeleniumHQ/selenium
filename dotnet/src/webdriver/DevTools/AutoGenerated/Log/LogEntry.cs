namespace OpenQA.Selenium.DevTools.Log
{
    using Newtonsoft.Json;

    /// <summary>
    /// Log entry.
    /// </summary>
    public sealed class LogEntry
    {
        /// <summary>
        /// Log entry source.
        ///</summary>
        [JsonProperty("source")]
        public string Source
        {
            get;
            set;
        }
        /// <summary>
        /// Log entry severity.
        ///</summary>
        [JsonProperty("level")]
        public string Level
        {
            get;
            set;
        }
        /// <summary>
        /// Logged text.
        ///</summary>
        [JsonProperty("text")]
        public string Text
        {
            get;
            set;
        }
        /// <summary>
        /// Timestamp when this entry was added.
        ///</summary>
        [JsonProperty("timestamp")]
        public double Timestamp
        {
            get;
            set;
        }
        /// <summary>
        /// URL of the resource if known.
        ///</summary>
        [JsonProperty("url", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Line number in the resource.
        ///</summary>
        [JsonProperty("lineNumber", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? LineNumber
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript stack trace.
        ///</summary>
        [JsonProperty("stackTrace", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.StackTrace StackTrace
        {
            get;
            set;
        }
        /// <summary>
        /// Identifier of the network request associated with this entry.
        ///</summary>
        [JsonProperty("networkRequestId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string NetworkRequestId
        {
            get;
            set;
        }
        /// <summary>
        /// Identifier of the worker associated with this entry.
        ///</summary>
        [JsonProperty("workerId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string WorkerId
        {
            get;
            set;
        }
        /// <summary>
        /// Call arguments.
        ///</summary>
        [JsonProperty("args", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.RemoteObject[] Args
        {
            get;
            set;
        }
    }
}