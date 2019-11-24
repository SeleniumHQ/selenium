namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enables or disables simulating a focused and active page.
    /// </summary>
    public sealed class SetFocusEmulationEnabledCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setFocusEmulationEnabled";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Whether to enable to disable focus emulation.
        /// </summary>
        [JsonProperty("enabled")]
        public bool Enabled
        {
            get;
            set;
        }
    }

    public sealed class SetFocusEmulationEnabledCommandResponse : ICommandResponse<SetFocusEmulationEnabledCommandSettings>
    {
    }
}