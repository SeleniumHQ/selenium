namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Reset all permission management for all origins.
    /// </summary>
    public sealed class ResetPermissionsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Browser.resetPermissions";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// BrowserContext to reset permissions. When omitted, default browser context is used.
        /// </summary>
        [JsonProperty("browserContextId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string BrowserContextId
        {
            get;
            set;
        }
    }

    public sealed class ResetPermissionsCommandResponse : ICommandResponse<ResetPermissionsCommandSettings>
    {
    }
}