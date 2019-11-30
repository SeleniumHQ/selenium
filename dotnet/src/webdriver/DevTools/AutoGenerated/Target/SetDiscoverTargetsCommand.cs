namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Controls whether to discover available targets and notify via
    /// `targetCreated/targetInfoChanged/targetDestroyed` events.
    /// </summary>
    public sealed class SetDiscoverTargetsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.setDiscoverTargets";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Whether to discover available targets.
        /// </summary>
        [JsonProperty("discover")]
        public bool Discover
        {
            get;
            set;
        }
    }

    public sealed class SetDiscoverTargetsCommandResponse : ICommandResponse<SetDiscoverTargetsCommandSettings>
    {
    }
}