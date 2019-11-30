namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Tries to update the web lifecycle state of the page.
    /// It will transition the page to the given state according to:
    /// https://github.com/WICG/web-lifecycle/
    /// </summary>
    public sealed class SetWebLifecycleStateCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.setWebLifecycleState";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Target lifecycle state
        /// </summary>
        [JsonProperty("state")]
        public string State
        {
            get;
            set;
        }
    }

    public sealed class SetWebLifecycleStateCommandResponse : ICommandResponse<SetWebLifecycleStateCommandSettings>
    {
    }
}