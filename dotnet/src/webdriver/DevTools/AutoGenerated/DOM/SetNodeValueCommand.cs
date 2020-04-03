namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets node value for a node with given id.
    /// </summary>
    public sealed class SetNodeValueCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.setNodeValue";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the node to set value for.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// New node's value.
        /// </summary>
        [JsonProperty("value")]
        public string Value
        {
            get;
            set;
        }
    }

    public sealed class SetNodeValueCommandResponse : ICommandResponse<SetNodeValueCommandSettings>
    {
    }
}