namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Blocks URLs from loading.
    /// </summary>
    public sealed class SetBlockedURLsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.setBlockedURLs";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// URL patterns to block. Wildcards ('*') are allowed.
        /// </summary>
        [JsonProperty("urls")]
        public string[] Urls
        {
            get;
            set;
        }
    }

    public sealed class SetBlockedURLsCommandResponse : ICommandResponse<SetBlockedURLsCommandSettings>
    {
    }
}