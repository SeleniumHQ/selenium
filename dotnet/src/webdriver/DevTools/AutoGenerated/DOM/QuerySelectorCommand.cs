namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Executes `querySelector` on a given node.
    /// </summary>
    public sealed class QuerySelectorCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.querySelector";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the node to query upon.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Selector string.
        /// </summary>
        [JsonProperty("selector")]
        public string Selector
        {
            get;
            set;
        }
    }

    public sealed class QuerySelectorCommandResponse : ICommandResponse<QuerySelectorCommandSettings>
    {
        /// <summary>
        /// Query selector result.
        ///</summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
    }
}