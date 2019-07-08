namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Detailed information about exception (or error) that was thrown during script compilation or
    /// execution.
    /// </summary>
    public sealed class ExceptionDetails
    {
        /// <summary>
        /// Exception id.
        ///</summary>
        [JsonProperty("exceptionId")]
        public long ExceptionId
        {
            get;
            set;
        }
        /// <summary>
        /// Exception text, which should be used together with exception object when available.
        ///</summary>
        [JsonProperty("text")]
        public string Text
        {
            get;
            set;
        }
        /// <summary>
        /// Line number of the exception location (0-based).
        ///</summary>
        [JsonProperty("lineNumber")]
        public long LineNumber
        {
            get;
            set;
        }
        /// <summary>
        /// Column number of the exception location (0-based).
        ///</summary>
        [JsonProperty("columnNumber")]
        public long ColumnNumber
        {
            get;
            set;
        }
        /// <summary>
        /// Script ID of the exception location.
        ///</summary>
        [JsonProperty("scriptId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ScriptId
        {
            get;
            set;
        }
        /// <summary>
        /// URL of the exception location, to be used when the script was not reported.
        ///</summary>
        [JsonProperty("url", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript stack trace if available.
        ///</summary>
        [JsonProperty("stackTrace", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public StackTrace StackTrace
        {
            get;
            set;
        }
        /// <summary>
        /// Exception object if available.
        ///</summary>
        [JsonProperty("exception", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public RemoteObject Exception
        {
            get;
            set;
        }
        /// <summary>
        /// Identifier of the context where exception happened.
        ///</summary>
        [JsonProperty("executionContextId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? ExecutionContextId
        {
            get;
            set;
        }
    }
}