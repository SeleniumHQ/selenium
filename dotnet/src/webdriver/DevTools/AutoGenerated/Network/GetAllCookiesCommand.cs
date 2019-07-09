namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns all browser cookies. Depending on the backend support, will return detailed cookie
    /// information in the `cookies` field.
    /// </summary>
    public sealed class GetAllCookiesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.getAllCookies";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetAllCookiesCommandResponse : ICommandResponse<GetAllCookiesCommandSettings>
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