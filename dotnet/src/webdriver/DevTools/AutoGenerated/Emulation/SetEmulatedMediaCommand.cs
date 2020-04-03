namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Emulates the given media for CSS media queries.
    /// </summary>
    public sealed class SetEmulatedMediaCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setEmulatedMedia";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Media type to emulate. Empty string disables the override.
        /// </summary>
        [JsonProperty("media")]
        public string Media
        {
            get;
            set;
        }
    }

    public sealed class SetEmulatedMediaCommandResponse : ICommandResponse<SetEmulatedMediaCommandSettings>
    {
    }
}