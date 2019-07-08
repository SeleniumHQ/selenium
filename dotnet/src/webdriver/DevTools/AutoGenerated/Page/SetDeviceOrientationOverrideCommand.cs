namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Overrides the Device Orientation.
    /// </summary>
    public sealed class SetDeviceOrientationOverrideCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.setDeviceOrientationOverride";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Mock alpha
        /// </summary>
        [JsonProperty("alpha")]
        public double Alpha
        {
            get;
            set;
        }
        /// <summary>
        /// Mock beta
        /// </summary>
        [JsonProperty("beta")]
        public double Beta
        {
            get;
            set;
        }
        /// <summary>
        /// Mock gamma
        /// </summary>
        [JsonProperty("gamma")]
        public double Gamma
        {
            get;
            set;
        }
    }

    public sealed class SetDeviceOrientationOverrideCommandResponse : ICommandResponse<SetDeviceOrientationOverrideCommandSettings>
    {
    }
}