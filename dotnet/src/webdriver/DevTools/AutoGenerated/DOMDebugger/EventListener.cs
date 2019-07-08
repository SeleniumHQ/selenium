namespace OpenQA.Selenium.DevTools.DOMDebugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Object event listener.
    /// </summary>
    public sealed class EventListener
    {
        /// <summary>
        /// `EventListener`'s type.
        ///</summary>
        [JsonProperty("type")]
        public string Type
        {
            get;
            set;
        }
        /// <summary>
        /// `EventListener`'s useCapture.
        ///</summary>
        [JsonProperty("useCapture")]
        public bool UseCapture
        {
            get;
            set;
        }
        /// <summary>
        /// `EventListener`'s passive flag.
        ///</summary>
        [JsonProperty("passive")]
        public bool Passive
        {
            get;
            set;
        }
        /// <summary>
        /// `EventListener`'s once flag.
        ///</summary>
        [JsonProperty("once")]
        public bool Once
        {
            get;
            set;
        }
        /// <summary>
        /// Script id of the handler code.
        ///</summary>
        [JsonProperty("scriptId")]
        public string ScriptId
        {
            get;
            set;
        }
        /// <summary>
        /// Line number in the script (0-based).
        ///</summary>
        [JsonProperty("lineNumber")]
        public long LineNumber
        {
            get;
            set;
        }
        /// <summary>
        /// Column number in the script (0-based).
        ///</summary>
        [JsonProperty("columnNumber")]
        public long ColumnNumber
        {
            get;
            set;
        }
        /// <summary>
        /// Event handler function value.
        ///</summary>
        [JsonProperty("handler", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.RemoteObject Handler
        {
            get;
            set;
        }
        /// <summary>
        /// Event original handler function value.
        ///</summary>
        [JsonProperty("originalHandler", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.RemoteObject OriginalHandler
        {
            get;
            set;
        }
        /// <summary>
        /// Node the listener is added to (if any).
        ///</summary>
        [JsonProperty("backendNodeId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? BackendNodeId
        {
            get;
            set;
        }
    }
}