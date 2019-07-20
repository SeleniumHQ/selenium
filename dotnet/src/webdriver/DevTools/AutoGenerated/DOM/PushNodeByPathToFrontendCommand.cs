namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Requests that the node is sent to the caller given its path. // FIXME, use XPath
    /// </summary>
    public sealed class PushNodeByPathToFrontendCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.pushNodeByPathToFrontend";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Path to node in the proprietary format.
        /// </summary>
        [JsonProperty("path")]
        public string Path
        {
            get;
            set;
        }
    }

    public sealed class PushNodeByPathToFrontendCommandResponse : ICommandResponse<PushNodeByPathToFrontendCommandSettings>
    {
        /// <summary>
        /// Id of the node for given path.
        ///</summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
    }
}