namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets node name for a node with given id.
    /// </summary>
    public sealed class SetNodeNameCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.setNodeName";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the node to set name for.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// New node's name.
        /// </summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
    }

    public sealed class SetNodeNameCommandResponse : ICommandResponse<SetNodeNameCommandSettings>
    {
        /// <summary>
        /// New node's id.
        ///</summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
    }
}