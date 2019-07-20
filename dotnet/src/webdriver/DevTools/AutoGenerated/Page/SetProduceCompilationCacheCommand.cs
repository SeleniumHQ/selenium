namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Forces compilation cache to be generated for every subresource script.
    /// </summary>
    public sealed class SetProduceCompilationCacheCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.setProduceCompilationCache";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Gets or sets the enabled
        /// </summary>
        [JsonProperty("enabled")]
        public bool Enabled
        {
            get;
            set;
        }
    }

    public sealed class SetProduceCompilationCacheCommandResponse : ICommandResponse<SetProduceCompilationCacheCommandSettings>
    {
    }
}