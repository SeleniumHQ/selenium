namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Seeds compilation cache for given url. Compilation cache does not survive
    /// cross-process navigation.
    /// </summary>
    public sealed class AddCompilationCacheCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.addCompilationCache";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the url
        /// </summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Base64-encoded data
        /// </summary>
        [JsonProperty("data")]
        public byte[] Data
        {
            get;
            set;
        }
    }

    public sealed class AddCompilationCacheCommandResponse : ICommandResponse<AddCompilationCacheCommandSettings>
    {
    }
}