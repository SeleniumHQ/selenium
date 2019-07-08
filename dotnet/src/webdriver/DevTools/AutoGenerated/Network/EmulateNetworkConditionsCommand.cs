namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Activates emulation of network conditions.
    /// </summary>
    public sealed class EmulateNetworkConditionsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.emulateNetworkConditions";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// True to emulate internet disconnection.
        /// </summary>
        [JsonProperty("offline")]
        public bool Offline
        {
            get;
            set;
        }
        /// <summary>
        /// Minimum latency from request sent to response headers received (ms).
        /// </summary>
        [JsonProperty("latency")]
        public double Latency
        {
            get;
            set;
        }
        /// <summary>
        /// Maximal aggregated download throughput (bytes/sec). -1 disables download throttling.
        /// </summary>
        [JsonProperty("downloadThroughput")]
        public double DownloadThroughput
        {
            get;
            set;
        }
        /// <summary>
        /// Maximal aggregated upload throughput (bytes/sec).  -1 disables upload throttling.
        /// </summary>
        [JsonProperty("uploadThroughput")]
        public double UploadThroughput
        {
            get;
            set;
        }
        /// <summary>
        /// Connection type if known.
        /// </summary>
        [JsonProperty("connectionType", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ConnectionType? ConnectionType
        {
            get;
            set;
        }
    }

    public sealed class EmulateNetworkConditionsCommandResponse : ICommandResponse<EmulateNetworkConditionsCommandSettings>
    {
    }
}