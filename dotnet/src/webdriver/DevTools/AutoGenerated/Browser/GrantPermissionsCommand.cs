namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Grant specific permissions to the given origin and reject all others.
    /// </summary>
    public sealed class GrantPermissionsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Browser.grantPermissions";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the origin
        /// </summary>
        [JsonProperty("origin")]
        public string Origin
        {
            get;
            set;
        }
        /// <summary>
        /// Gets or sets the permissions
        /// </summary>
        [JsonProperty("permissions")]
        public PermissionType[] Permissions
        {
            get;
            set;
        }
        /// <summary>
        /// BrowserContext to override permissions. When omitted, default browser context is used.
        /// </summary>
        [JsonProperty("browserContextId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string BrowserContextId
        {
            get;
            set;
        }
    }

    public sealed class GrantPermissionsCommandResponse : ICommandResponse<GrantPermissionsCommandSettings>
    {
    }
}