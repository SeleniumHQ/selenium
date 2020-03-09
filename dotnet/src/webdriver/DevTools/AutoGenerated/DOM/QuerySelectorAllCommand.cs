namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Executes `querySelectorAll` on a given node.
    /// </summary>
    public sealed class QuerySelectorAllCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.querySelectorAll";
        
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

    public sealed class QuerySelectorAllCommandResponse : ICommandResponse<QuerySelectorAllCommandSettings>
    {
        /// <summary>
        /// Query selector result.
        ///</summary>
        [JsonProperty("nodeIds")]
        public long[] NodeIds
        {
            get;
            set;
        }
    }
}