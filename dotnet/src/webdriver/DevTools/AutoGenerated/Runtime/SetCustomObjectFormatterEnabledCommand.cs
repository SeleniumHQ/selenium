namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// SetCustomObjectFormatterEnabled
    /// </summary>
    public sealed class SetCustomObjectFormatterEnabledCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.setCustomObjectFormatterEnabled";
        
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

    public sealed class SetCustomObjectFormatterEnabledCommandResponse : ICommandResponse<SetCustomObjectFormatterEnabledCommandSettings>
    {
    }
}