namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Creates a deep copy of the specified node and places it into the target container before the
    /// given anchor.
    /// </summary>
    public sealed class CopyToCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.copyTo";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the node to copy.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Id of the element to drop the copy into.
        /// </summary>
        [JsonProperty("targetNodeId")]
        public long TargetNodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Drop the copy before this node (if absent, the copy becomes the last child of
        /// `targetNodeId`).
        /// </summary>
        [JsonProperty("insertBeforeNodeId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? InsertBeforeNodeId
        {
            get;
            set;
        }
    }

    public sealed class CopyToCommandResponse : ICommandResponse<CopyToCommandSettings>
    {
        /// <summary>
        /// Id of the node clone.
        ///</summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
    }
}