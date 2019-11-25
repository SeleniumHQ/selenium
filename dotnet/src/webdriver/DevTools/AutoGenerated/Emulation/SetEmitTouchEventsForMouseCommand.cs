namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// SetEmitTouchEventsForMouse
    /// </summary>
    public sealed class SetEmitTouchEventsForMouseCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setEmitTouchEventsForMouse";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Whether touch emulation based on mouse input should be enabled.
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

    public sealed class SetEmitTouchEventsForMouseCommandResponse : ICommandResponse<SetEmitTouchEventsForMouseCommandSettings>
    {
    }
}