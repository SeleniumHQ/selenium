namespace OpenQA.Selenium.DevTools.DOMDebugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Removes breakpoint from XMLHttpRequest.
    /// </summary>
    public sealed class RemoveXHRBreakpointCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOMDebugger.removeXHRBreakpoint";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Resource URL substring.
        /// </summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
    }

    public sealed class RemoveXHRBreakpointCommandResponse : ICommandResponse<RemoveXHRBreakpointCommandSettings>
    {
    }
}