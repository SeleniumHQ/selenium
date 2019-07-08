namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enable page Content Security Policy by-passing.
    /// </summary>
    public sealed class SetBypassCSPCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.setBypassCSP";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Whether to bypass page CSP.
        /// </summary>
        [JsonProperty("enabled")]
        public bool Enabled
        {
            get;
            set;
        }
    }

    public sealed class SetBypassCSPCommandResponse : ICommandResponse<SetBypassCSPCommandSettings>
    {
    }
}