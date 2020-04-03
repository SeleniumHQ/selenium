namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Tells whether emulation is supported.
    /// </summary>
    public sealed class CanEmulateCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.canEmulate";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class CanEmulateCommandResponse : ICommandResponse<CanEmulateCommandSettings>
    {
        /// <summary>
        /// True if emulation is supported.
        ///</summary>
        [JsonProperty("result")]
        public bool Result
        {
            get;
            set;
        }
    }
}