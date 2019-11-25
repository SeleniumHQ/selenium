namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Deletes browser cookies with matching name and url or domain/path pair.
    /// </summary>
    public sealed class DeleteCookiesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.deleteCookies";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Name of the cookies to remove.
        /// </summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// If specified, deletes all the cookies with the given name where domain and path match
        /// provided URL.
        /// </summary>
        [JsonProperty("url", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// If specified, deletes only cookies with the exact domain.
        /// </summary>
        [JsonProperty("domain", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Domain
        {
            get;
            set;
        }
        /// <summary>
        /// If specified, deletes only cookies with the exact path.
        /// </summary>
        [JsonProperty("path", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Path
        {
            get;
            set;
        }
    }

    public sealed class DeleteCookiesCommandResponse : ICommandResponse<DeleteCookiesCommandSettings>
    {
    }
}