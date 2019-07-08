namespace OpenQA.Selenium.DevTools.DOMDebugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Removes breakpoint on particular DOM event.
    /// </summary>
    public sealed class RemoveEventListenerBreakpointCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOMDebugger.removeEventListenerBreakpoint";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Event name.
        /// </summary>
        [JsonProperty("eventName")]
        public string EventName
        {
            get;
            set;
        }
        /// <summary>
        /// EventTarget interface name.
        /// </summary>
        [JsonProperty("targetName", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string TargetName
        {
            get;
            set;
        }
    }

    public sealed class RemoveEventListenerBreakpointCommandResponse : ICommandResponse<RemoveEventListenerBreakpointCommandSettings>
    {
    }
}