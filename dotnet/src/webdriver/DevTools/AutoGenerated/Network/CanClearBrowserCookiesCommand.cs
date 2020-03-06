namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Tells whether clearing browser cookies is supported.
    /// </summary>
    public sealed class CanClearBrowserCookiesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.canClearBrowserCookies";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class CanClearBrowserCookiesCommandResponse : ICommandResponse<CanClearBrowserCookiesCommandSettings>
    {
        /// <summary>
        /// True if browser cookies can be cleared.
        ///</summary>
        [JsonProperty("result")]
        public bool Result
        {
            get;
            set;
        }
    }
}