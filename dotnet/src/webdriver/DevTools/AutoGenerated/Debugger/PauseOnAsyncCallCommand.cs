namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// PauseOnAsyncCall
    /// </summary>
    public sealed class PauseOnAsyncCallCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.pauseOnAsyncCall";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Debugger will pause when async call with given stack trace is started.
        /// </summary>
        [JsonProperty("parentStackTraceId")]
        public Runtime.StackTraceId ParentStackTraceId
        {
            get;
            set;
        }
    }

    public sealed class PauseOnAsyncCallCommandResponse : ICommandResponse<PauseOnAsyncCallCommandSettings>
    {
    }
}