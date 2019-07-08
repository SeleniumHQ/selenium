namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Tells whether clearing browser cache is supported.
    /// </summary>
    public sealed class CanClearBrowserCacheCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.canClearBrowserCache";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class CanClearBrowserCacheCommandResponse : ICommandResponse<CanClearBrowserCacheCommandSettings>
    {
        /// <summary>
        /// True if browser cache can be cleared.
        ///</summary>
        [JsonProperty("result")]
        public bool Result
        {
            get;
            set;
        }
    }
}