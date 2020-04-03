namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Toggles mouse event-based touch event emulation.
    /// </summary>
    public sealed class SetTouchEmulationEnabledCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.setTouchEmulationEnabled";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Whether the touch event emulation should be enabled.
        /// </summary>
        [JsonProperty("enabled")]
        public bool Enabled
        {
            get;
            set;
        }
        /// <summary>
        /// Touch/gesture events configuration. Default: current platform.
        /// </summary>
        [JsonProperty("configuration", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Configuration
        {
            get;
            set;
        }
    }

    public sealed class SetTouchEmulationEnabledCommandResponse : ICommandResponse<SetTouchEmulationEnabledCommandSettings>
    {
    }
}