namespace OpenQA.Selenium.DevTools.Emulation
{
    using Newtonsoft.Json;

    /// <summary>
    /// Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position
    /// unavailable.
    /// </summary>
    public sealed class SetGeolocationOverrideCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Emulation.setGeolocationOverride";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Mock latitude
        /// </summary>
        [JsonProperty("latitude", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? Latitude
        {
            get;
            set;
        }
        /// <summary>
        /// Mock longitude
        /// </summary>
        [JsonProperty("longitude", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? Longitude
        {
            get;
            set;
        }
        /// <summary>
        /// Mock accuracy
        /// </summary>
        [JsonProperty("accuracy", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? Accuracy
        {
            get;
            set;
        }
    }

    public sealed class SetGeolocationOverrideCommandResponse : ICommandResponse<SetGeolocationOverrideCommandSettings>
    {
    }
}