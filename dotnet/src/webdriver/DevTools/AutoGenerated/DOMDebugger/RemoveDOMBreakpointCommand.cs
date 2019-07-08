namespace OpenQA.Selenium.DevTools.DOMDebugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Removes DOM breakpoint that was set using `setDOMBreakpoint`.
    /// </summary>
    public sealed class RemoveDOMBreakpointCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOMDebugger.removeDOMBreakpoint";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Identifier of the node to remove breakpoint from.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Type of the breakpoint to remove.
        /// </summary>
        [JsonProperty("type")]
        public DOMBreakpointType Type
        {
            get;
            set;
        }
    }

    public sealed class RemoveDOMBreakpointCommandResponse : ICommandResponse<RemoveDOMBreakpointCommandSettings>
    {
    }
}