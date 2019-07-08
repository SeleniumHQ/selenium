namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns all browser cookies. Depending on the backend support, will return detailed cookie
    /// information in the `cookies` field.
    /// </summary>
    public sealed class GetCookiesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.getCookies";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetCookiesCommandResponse : ICommandResponse<GetCookiesCommandSettings>
    {
        /// <summary>
        /// Array of cookie objects.
        ///</summary>
        [JsonProperty("cookies")]
        public Network.Cookie[] Cookies
        {
            get;
            set;
        }
    }
}