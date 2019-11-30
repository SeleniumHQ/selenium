namespace OpenQA.Selenium.DevTools.Debugger
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when virtual machine fails to parse the script.
    /// </summary>
    public sealed class ScriptFailedToParseEventArgs : EventArgs
    {
        /// <summary>
        /// Identifier of the script parsed.
        /// </summary>
        [JsonProperty("scriptId")]
        public string ScriptId
        {
            get;
            set;
        }
        /// <summary>
        /// URL or name of the script parsed (if any).
        /// </summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Line offset of the script within the resource with given URL (for script tags).
        /// </summary>
        [JsonProperty("startLine")]
        public long StartLine
        {
            get;
            set;
        }
        /// <summary>
        /// Column offset of the script within the resource with given URL.
        /// </summary>
        [JsonProperty("startColumn")]
        public long StartColumn
        {
            get;
            set;
        }
        /// <summary>
        /// Last line of the script.
        /// </summary>
        [JsonProperty("endLine")]
        public long EndLine
        {
            get;
            set;
        }
        /// <summary>
        /// Length of the last line of the script.
        /// </summary>
        [JsonProperty("endColumn")]
        public long EndColumn
        {
            get;
            set;
        }
        /// <summary>
        /// Specifies script creation context.
        /// </summary>
        [JsonProperty("executionContextId")]
        public long ExecutionContextId
        {
            get;
            set;
        }
        /// <summary>
        /// Content hash of the script.
        /// </summary>
        [JsonProperty("hash")]
        public string Hash
        {
            get;
            set;
        }
        /// <summary>
        /// Embedder-specific auxiliary data.
        /// </summary>
        [JsonProperty("executionContextAuxData", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public object ExecutionContextAuxData
        {
            get;
            set;
        }
        /// <summary>
        /// URL of source map associated with script (if any).
        /// </summary>
        [JsonProperty("sourceMapURL", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string SourceMapURL
        {
            get;
            set;
        }
        /// <summary>
        /// True, if this script has sourceURL.
        /// </summary>
        [JsonProperty("hasSourceURL", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? HasSourceURL
        {
            get;
            set;
        }
        /// <summary>
        /// True, if this script is ES6 module.
        /// </summary>
        [JsonProperty("isModule", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsModule
        {
            get;
            set;
        }
        /// <summary>
        /// This script length.
        /// </summary>
        [JsonProperty("length", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Length
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript top stack frame of where the script parsed event was triggered if available.
        /// </summary>
        [JsonProperty("stackTrace", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.StackTrace StackTrace
        {
            get;
            set;
        }
    }
}