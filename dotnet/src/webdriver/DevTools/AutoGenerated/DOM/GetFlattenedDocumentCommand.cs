namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns the root DOM node (and optionally the subtree) to the caller.
    /// </summary>
    public sealed class GetFlattenedDocumentCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.getFlattenedDocument";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
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

    public sealed class GetFlattenedDocumentCommandResponse : ICommandResponse<GetFlattenedDocumentCommandSettings>
    {
        /// <summary>
        /// Resulting node.
        ///</summary>
        [JsonProperty("nodes")]
        public Node[] Nodes
        {
            get;
            set;
        }
    }
}