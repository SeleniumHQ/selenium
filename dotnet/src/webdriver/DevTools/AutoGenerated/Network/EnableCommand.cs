namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enables network tracking, network events will now be delivered to the client.
    /// </summary>
    public sealed class EnableCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.enable";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Buffer size in bytes to use when preserving network payloads (XHRs, etc).
        /// </summary>
        [JsonProperty("maxTotalBufferSize", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? MaxTotalBufferSize
        {
            get;
            set;
        }
        /// <summary>
        /// Per-resource buffer size in bytes to use when preserving network payloads (XHRs, etc).
        /// </summary>
        [JsonProperty("maxResourceBufferSize", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? MaxResourceBufferSize
        {
            get;
            set;
        }
        /// <summary>
        /// Longest post body size (in bytes) that would be included in requestWillBeSent notification
        /// </summary>
        [JsonProperty("maxPostDataSize", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? MaxPostDataSize
        {
            get;
            set;
        }
    }

    public sealed class EnableCommandResponse : ICommandResponse<EnableCommandSettings>
    {
    }
}