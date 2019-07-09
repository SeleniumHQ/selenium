namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Restarts particular call frame from the beginning.
    /// </summary>
    public sealed class RestartFrameCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.restartFrame";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Call frame identifier to evaluate on.
        /// </summary>
        [JsonProperty("callFrameId")]
        public string CallFrameId
        {
            get;
            set;
        }
    }

    public sealed class RestartFrameCommandResponse : ICommandResponse<RestartFrameCommandSettings>
    {
        /// <summary>
        /// New stack trace.
        ///</summary>
        [JsonProperty("callFrames")]
        public CallFrame[] CallFrames
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
    }
}