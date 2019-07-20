namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns attributes for the specified node.
    /// </summary>
    public sealed class GetAttributesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.getAttributes";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the node to retrieve attibutes for.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
    }

    public sealed class GetAttributesCommandResponse : ICommandResponse<GetAttributesCommandSettings>
    {
        /// <summary>
        /// An interleaved array of node attribute names and values.
        ///</summary>
        [JsonProperty("attributes")]
        public string[] Attributes
        {
            get;
            set;
        }
    }
}