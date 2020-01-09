namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns stack trace with given `stackTraceId`.
    /// </summary>
    public sealed class GetStackTraceCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.getStackTrace";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the stackTraceId
        /// </summary>
        [JsonProperty("stackTraceId")]
        public Runtime.StackTraceId StackTraceId
        {
            get;
            set;
        }
    }

    public sealed class GetStackTraceCommandResponse : ICommandResponse<GetStackTraceCommandSettings>
    {
        /// <summary>
        /// Gets or sets the stackTrace
        /// </summary>
        [JsonProperty("stackTrace")]
        public Runtime.StackTrace StackTrace
        {
            get;
            set;
        }
    }
}