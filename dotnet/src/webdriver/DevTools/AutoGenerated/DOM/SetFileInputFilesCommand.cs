namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets files for the given file input element.
    /// </summary>
    public sealed class SetFileInputFilesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.setFileInputFiles";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Array of file paths to set.
        /// </summary>
        [JsonProperty("files")]
        public string[] Files
        {
            get;
            set;
        }
        /// <summary>
        /// Identifier of the node.
        /// </summary>
        [JsonProperty("nodeId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Identifier of the backend node.
        /// </summary>
        [JsonProperty("backendNodeId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? BackendNodeId
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript object id of the node wrapper.
        /// </summary>
        [JsonProperty("objectId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ObjectId
        {
            get;
            set;
        }
    }

    public sealed class SetFileInputFilesCommandResponse : ICommandResponse<SetFileInputFilesCommandSettings>
    {
    }
}