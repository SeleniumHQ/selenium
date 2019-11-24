namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Requests that the node is sent to the caller given the JavaScript node object reference. All
    /// nodes that form the path from the node to the root are also sent to the client as a series of
    /// `setChildNodes` notifications.
    /// </summary>
    public sealed class RequestNodeCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.requestNode";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// JavaScript object id to convert into node.
        /// </summary>
        [JsonProperty("objectId")]
        public string ObjectId
        {
            get;
            set;
        }
    }

    public sealed class RequestNodeCommandResponse : ICommandResponse<RequestNodeCommandSettings>
    {
        /// <summary>
        /// Node id for given object.
        ///</summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
    }
}