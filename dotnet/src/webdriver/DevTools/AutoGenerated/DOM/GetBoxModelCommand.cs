namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns boxes for the given node.
    /// </summary>
    public sealed class GetBoxModelCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.getBoxModel";
        
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
    }

    public sealed class GetBoxModelCommandResponse : ICommandResponse<GetBoxModelCommandSettings>
    {
        /// <summary>
        /// Box model for the node.
        ///</summary>
        [JsonProperty("model")]
        public BoxModel Model
        {
            get;
            set;
        }
    }
}