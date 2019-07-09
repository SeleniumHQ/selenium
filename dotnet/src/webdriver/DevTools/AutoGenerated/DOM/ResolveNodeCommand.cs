namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Resolves the JavaScript node object for a given NodeId or BackendNodeId.
    /// </summary>
    public sealed class ResolveNodeCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.resolveNode";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the node to resolve.
        /// </summary>
        [JsonProperty("nodeId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Backend identifier of the node to resolve.
        /// </summary>
        [JsonProperty("backendNodeId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? BackendNodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Symbolic group name that can be used to release multiple objects.
        /// </summary>
        [JsonProperty("objectGroup", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ObjectGroup
        {
            get;
            set;
        }
        /// <summary>
        /// Execution context in which to resolve the node.
        /// </summary>
        [JsonProperty("executionContextId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? ExecutionContextId
        {
            get;
            set;
        }
    }

    public sealed class ResolveNodeCommandResponse : ICommandResponse<ResolveNodeCommandSettings>
    {
        /// <summary>
        /// JavaScript object wrapper for given node.
        ///</summary>
        [JsonProperty("object")]
        public Runtime.RemoteObject Object
        {
            get;
            set;
        }
    }
}