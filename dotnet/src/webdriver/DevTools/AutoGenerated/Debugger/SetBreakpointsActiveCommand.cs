namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Activates / deactivates all breakpoints on the page.
    /// </summary>
    public sealed class SetBreakpointsActiveCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.setBreakpointsActive";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// New value for breakpoints active state.
        /// </summary>
        [JsonProperty("active")]
        public bool Active
        {
            get;
            set;
        }
    }

    public sealed class SetBreakpointsActiveCommandResponse : ICommandResponse<SetBreakpointsActiveCommandSettings>
    {
    }
}