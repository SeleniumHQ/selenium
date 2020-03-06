namespace OpenQA.Selenium.DevTools.DOMDebugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets breakpoint on particular DOM event.
    /// </summary>
    public sealed class SetEventListenerBreakpointCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOMDebugger.setEventListenerBreakpoint";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// DOM Event name to stop on (any DOM event will do).
        /// </summary>
        [JsonProperty("eventName")]
        public string EventName
        {
            get;
            set;
        }
        /// <summary>
        /// EventTarget interface name to stop on. If equal to `"*"` or not provided, will stop on any
        /// EventTarget.
        /// </summary>
        [JsonProperty("targetName", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string TargetName
        {
            get;
            set;
        }
    }

    public sealed class SetEventListenerBreakpointCommandResponse : ICommandResponse<SetEventListenerBreakpointCommandSettings>
    {
    }
}