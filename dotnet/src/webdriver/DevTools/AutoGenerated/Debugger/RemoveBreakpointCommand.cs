namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Removes JavaScript breakpoint.
    /// </summary>
    public sealed class RemoveBreakpointCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.removeBreakpoint";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the breakpointId
        /// </summary>
        [JsonProperty("breakpointId")]
        public string BreakpointId
        {
            get;
            set;
        }
    }

    public sealed class RemoveBreakpointCommandResponse : ICommandResponse<RemoveBreakpointCommandSettings>
    {
    }
}