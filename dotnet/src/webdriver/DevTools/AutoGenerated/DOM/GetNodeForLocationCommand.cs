namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns node id at given location. Depending on whether DOM domain is enabled, nodeId is
    /// either returned or not.
    /// </summary>
    public sealed class GetNodeForLocationCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.getNodeForLocation";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// X coordinate.
        /// </summary>
        [JsonProperty("x")]
        public long X
        {
            get;
            set;
        }
        /// <summary>
        /// Y coordinate.
        /// </summary>
        [JsonProperty("y")]
        public long Y
        {
            get;
            set;
        }
        /// <summary>
        /// False to skip to the nearest non-UA shadow root ancestor (default: false).
        /// </summary>
        [JsonProperty("includeUserAgentShadowDOM", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IncludeUserAgentShadowDOM
        {
            get;
            set;
        }
    }

    public sealed class GetNodeForLocationCommandResponse : ICommandResponse<GetNodeForLocationCommandSettings>
    {
        /// <summary>
        /// Resulting node.
        ///</summary>
        [JsonProperty("backendNodeId")]
        public long BackendNodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Id of the node at given coordinates, only when enabled and requested document.
        ///</summary>
        [JsonProperty("nodeId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? NodeId
        {
            get;
            set;
        }
    }
}