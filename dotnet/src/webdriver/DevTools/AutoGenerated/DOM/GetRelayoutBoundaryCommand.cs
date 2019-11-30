namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns the id of the nearest ancestor that is a relayout boundary.
    /// </summary>
    public sealed class GetRelayoutBoundaryCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.getRelayoutBoundary";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the node.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
    }

    public sealed class GetRelayoutBoundaryCommandResponse : ICommandResponse<GetRelayoutBoundaryCommandSettings>
    {
        /// <summary>
        /// Relayout boundary node id for the given node.
        ///</summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
    }
}