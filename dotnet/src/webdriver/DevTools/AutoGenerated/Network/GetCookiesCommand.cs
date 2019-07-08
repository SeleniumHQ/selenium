namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns all browser cookies for the current URL. Depending on the backend support, will return
    /// detailed cookie information in the `cookies` field.
    /// </summary>
    public sealed class GetCookiesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.getCookies";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// The list of URLs for which applicable cookies will be fetched
        /// </summary>
        [JsonProperty("urls", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string[] Urls
        {
            get;
            set;
        }
    }

    public sealed class GetCookiesCommandResponse : ICommandResponse<GetCookiesCommandSettings>
    {
        /// <summary>
        /// Array of cookie objects.
        ///</summary>
        [JsonProperty("cookies")]
        public Cookie[] Cookies
        {
            get;
            set;
        }
    }
}