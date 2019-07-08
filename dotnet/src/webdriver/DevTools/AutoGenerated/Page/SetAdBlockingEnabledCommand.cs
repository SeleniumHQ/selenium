namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enable Chrome's experimental ad filter on all sites.
    /// </summary>
    public sealed class SetAdBlockingEnabledCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.setAdBlockingEnabled";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Whether to block ads.
        /// </summary>
        [JsonProperty("enabled")]
        public bool Enabled
        {
            get;
            set;
        }
    }

    public sealed class SetAdBlockingEnabledCommandResponse : ICommandResponse<SetAdBlockingEnabledCommandSettings>
    {
    }
}