namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Requests that children of the node with given id are returned to the caller in form of
    /// `setChildNodes` events where not only immediate children are retrieved, but all children down to
    /// the specified depth.
    /// </summary>
    public sealed class RequestChildNodesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.requestChildNodes";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the node to get children for.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
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
        /// Whether or not iframes and shadow roots should be traversed when returning the sub-tree
        /// (default is false).
        /// </summary>
        [JsonProperty("pierce", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Pierce
        {
            get;
            set;
        }
    }

    public sealed class RequestChildNodesCommandResponse : ICommandResponse<RequestChildNodesCommandSettings>
    {
    }
}