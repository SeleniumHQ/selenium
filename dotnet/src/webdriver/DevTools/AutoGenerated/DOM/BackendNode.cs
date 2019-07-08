namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Backend node with a friendly name.
    /// </summary>
    public sealed class BackendNode
    {
        /// <summary>
        /// `Node`'s nodeType.
        ///</summary>
        [JsonProperty("nodeType")]
        public long NodeType
        {
            get;
            set;
        }
        /// <summary>
        /// `Node`'s nodeName.
        ///</summary>
        [JsonProperty("nodeName")]
        public string NodeName
        {
            get;
            set;
        }
        /// <summary>
        /// backendNodeId
        ///</summary>
        [JsonProperty("backendNodeId")]
        public long BackendNodeId
        {
            get;
            set;
        }
    }
}