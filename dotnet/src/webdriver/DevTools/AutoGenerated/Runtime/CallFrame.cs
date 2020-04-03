namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Stack entry for runtime errors and assertions.
    /// </summary>
    public sealed class CallFrame
    {
        /// <summary>
        /// JavaScript function name.
        ///</summary>
        [JsonProperty("functionName")]
        public string FunctionName
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript script id.
        ///</summary>
        [JsonProperty("scriptId")]
        public string ScriptId
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript script name or url.
        ///</summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript script line number (0-based).
        ///</summary>
        [JsonProperty("lineNumber")]
        public long LineNumber
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript script column number (0-based).
        ///</summary>
        [JsonProperty("columnNumber")]
        public long ColumnNumber
        {
            get;
            set;
        }
    }
}