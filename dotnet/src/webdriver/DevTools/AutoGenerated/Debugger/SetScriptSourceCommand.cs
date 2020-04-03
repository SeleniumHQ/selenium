namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Edits JavaScript source live.
    /// </summary>
    public sealed class SetScriptSourceCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.setScriptSource";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the script to edit.
        /// </summary>
        [JsonProperty("scriptId")]
        public string ScriptId
        {
            get;
            set;
        }
        /// <summary>
        /// New content of the script.
        /// </summary>
        [JsonProperty("scriptSource")]
        public string ScriptSource
        {
            get;
            set;
        }
        /// <summary>
        /// If true the change will not actually be applied. Dry run may be used to get result
        /// description without actually modifying the code.
        /// </summary>
        [JsonProperty("dryRun", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? DryRun
        {
            get;
            set;
        }
    }

    public sealed class SetScriptSourceCommandResponse : ICommandResponse<SetScriptSourceCommandSettings>
    {
        /// <summary>
        /// New stack trace in case editing has happened while VM was stopped.
        ///</summary>
        [JsonProperty("callFrames", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public CallFrame[] CallFrames
        {
            get;
            set;
        }
        /// <summary>
        /// Whether current call stack  was modified after applying the changes.
        ///</summary>
        [JsonProperty("stackChanged", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? StackChanged
        {
            get;
            set;
        }
        /// <summary>
        /// Async stack trace, if any.
        ///</summary>
        [JsonProperty("asyncStackTrace", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.StackTrace AsyncStackTrace
        {
            get;
            set;
        }
        /// <summary>
        /// Async stack trace, if any.
        ///</summary>
        [JsonProperty("asyncStackTraceId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.StackTraceId AsyncStackTraceId
        {
            get;
            set;
        }
        /// <summary>
        /// Exception details if any.
        ///</summary>
        [JsonProperty("exceptionDetails", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.ExceptionDetails ExceptionDetails
        {
            get;
            set;
        }
    }
}