namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enables touch on platforms which do not support them.
    /// </summary>
    public sealed class SetTouchEmulationEnabledCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setTouchEmulationEnabled";
        
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
        /// Maximum touch points supported. Defaults to one.
        /// </summary>
        [JsonProperty("maxTouchPoints", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? MaxTouchPoints
        {
            get;
            set;
        }
    }

    public sealed class SetTouchEmulationEnabledCommandResponse : ICommandResponse<SetTouchEmulationEnabledCommandSettings>
    {
    }
}