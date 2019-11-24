namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enables or disables async call stacks tracking.
    /// </summary>
    public sealed class SetAsyncCallStackDepthCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.setAsyncCallStackDepth";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Maximum depth of async call stacks. Setting to `0` will effectively disable collecting async
        /// call stacks (default).
        /// </summary>
        [JsonProperty("maxDepth")]
        public long MaxDepth
        {
            get;
            set;
        }
    }

    public sealed class SetAsyncCallStackDepthCommandResponse : ICommandResponse<SetAsyncCallStackDepthCommandSettings>
    {
    }
}