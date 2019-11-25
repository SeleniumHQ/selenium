namespace OpenQA.Selenium.DevTools.DOMDebugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets breakpoint on XMLHttpRequest.
    /// </summary>
    public sealed class SetXHRBreakpointCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOMDebugger.setXHRBreakpoint";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Resource URL substring. All XHRs having this substring in the URL will get stopped upon.
        /// </summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
    }

    public sealed class SetXHRBreakpointCommandResponse : ICommandResponse<SetXHRBreakpointCommandSettings>
    {
    }
}