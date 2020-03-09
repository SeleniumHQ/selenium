namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// GetAppManifest
    /// </summary>
    public sealed class GetAppManifestCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.getAppManifest";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetAppManifestCommandResponse : ICommandResponse<GetAppManifestCommandSettings>
    {
        /// <summary>
        /// Manifest location.
        ///</summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Gets or sets the errors
        /// </summary>
        [JsonProperty("errors")]
        public AppManifestError[] Errors
        {
            get;
            set;
        }
        /// <summary>
        /// Manifest content.
        ///</summary>
        [JsonProperty("data", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Data
        {
            get;
            set;
        }
    }
}