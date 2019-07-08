namespace OpenQA.Selenium.DevTools.DOMDebugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets breakpoint on particular operation with DOM.
    /// </summary>
    public sealed class SetDOMBreakpointCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOMDebugger.setDOMBreakpoint";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Identifier of the node to set breakpoint on.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Type of the operation to stop upon.
        /// </summary>
        [JsonProperty("type")]
        public DOMBreakpointType Type
        {
            get;
            set;
        }
    }

    public sealed class SetDOMBreakpointCommandResponse : ICommandResponse<SetDOMBreakpointCommandSettings>
    {
    }
}