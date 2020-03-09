namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Toggles ignoring cache for each request. If `true`, cache will not be used.
    /// </summary>
    public sealed class SetCacheDisabledCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.setCacheDisabled";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Cache disabled state.
        /// </summary>
        [JsonProperty("cacheDisabled")]
        public bool CacheDisabled
        {
            get;
            set;
        }
    }

    public sealed class SetCacheDisabledCommandResponse : ICommandResponse<SetCacheDisabledCommandSettings>
    {
    }
}