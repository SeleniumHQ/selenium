namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Describes node given its id, does not require domain to be enabled. Does not start tracking any
    /// objects, can be used for automation.
    /// </summary>
    public sealed class DescribeNodeCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.describeNode";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Identifier of the node.
        /// </summary>
        [JsonProperty("nodeId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Identifier of the backend node.
        /// </summary>
        [JsonProperty("backendNodeId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? BackendNodeId
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript object id of the node wrapper.
        /// </summary>
        [JsonProperty("objectId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ObjectId
        {
            get;
            set;
        }
        /// <summary>
        /// The maximum depth at which children should be retrieved, defaults to 1. Use -1 for the
        /// entire subtree or provide an integer larger than 0.
        /// </summary>
        [JsonProperty("depth", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Depth
        {
            get;
            set;
        }
        /// <summary>
        /// Whether or not iframes and shadow roots should be traversed when returning the subtree
        /// (default is false).
        /// </summary>
        [JsonProperty("pierce", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Pierce
        {
            get;
            set;
        }
    }

    public sealed class DescribeNodeCommandResponse : ICommandResponse<DescribeNodeCommandSettings>
    {
        /// <summary>
        /// Node description.
        ///</summary>
        [JsonProperty("node")]
        public Node Node
        {
            get;
            set;
        }
    }
}