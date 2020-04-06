namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Tells whether emulation of network conditions is supported.
    /// </summary>
    public sealed class CanEmulateNetworkConditionsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.canEmulateNetworkConditions";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class CanEmulateNetworkConditionsCommandResponse : ICommandResponse<CanEmulateNetworkConditionsCommandSettings>
    {
        /// <summary>
        /// True if emulation of network conditions is supported.
        ///</summary>
        [JsonProperty("result")]
        public bool Result
        {
            get;
            set;
        }
    }
}