namespace OpenQA.Selenium.DevTools.DOMDebugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets breakpoint on particular native event.
    /// </summary>
    public sealed class SetInstrumentationBreakpointCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOMDebugger.setInstrumentationBreakpoint";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Instrumentation name to stop on.
        /// </summary>
        [JsonProperty("eventName")]
        public string EventName
        {
            get;
            set;
        }
    }

    public sealed class SetInstrumentationBreakpointCommandResponse : ICommandResponse<SetInstrumentationBreakpointCommandSettings>
    {
    }
}