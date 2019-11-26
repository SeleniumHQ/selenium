namespace OpenQA.Selenium.DevTools.DOMDebugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Removes breakpoint on particular native event.
    /// </summary>
    public sealed class RemoveInstrumentationBreakpointCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOMDebugger.removeInstrumentationBreakpoint";
        
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

    public sealed class RemoveInstrumentationBreakpointCommandResponse : ICommandResponse<RemoveInstrumentationBreakpointCommandSettings>
    {
    }
}