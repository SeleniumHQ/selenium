namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets given cookies.
    /// </summary>
    public sealed class SetCookiesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.setCookies";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Cookies to be set.
        /// </summary>
        [JsonProperty("cookies")]
        public CookieParam[] Cookies
        {
            get;
            set;
        }
    }

    public sealed class SetCookiesCommandResponse : ICommandResponse<SetCookiesCommandSettings>
    {
    }
}