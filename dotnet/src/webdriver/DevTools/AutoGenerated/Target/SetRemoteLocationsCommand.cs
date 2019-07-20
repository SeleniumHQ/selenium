namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enables target discovery for the specified locations, when `setDiscoverTargets` was set to
    /// `true`.
    /// </summary>
    public sealed class SetRemoteLocationsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.setRemoteLocations";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// List of remote locations.
        /// </summary>
        [JsonProperty("locations")]
        public RemoteLocation[] Locations
        {
            get;
            set;
        }
    }

    public sealed class SetRemoteLocationsCommandResponse : ICommandResponse<SetRemoteLocationsCommandSettings>
    {
    }
}