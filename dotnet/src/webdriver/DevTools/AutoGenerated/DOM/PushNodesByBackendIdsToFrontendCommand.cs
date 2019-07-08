namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Requests that a batch of nodes is sent to the caller given their backend node ids.
    /// </summary>
    public sealed class PushNodesByBackendIdsToFrontendCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.pushNodesByBackendIdsToFrontend";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// The array of backend node ids.
        /// </summary>
        [JsonProperty("backendNodeIds")]
        public long[] BackendNodeIds
        {
            get;
            set;
        }
    }

    public sealed class PushNodesByBackendIdsToFrontendCommandResponse : ICommandResponse<PushNodesByBackendIdsToFrontendCommandSettings>
    {
        /// <summary>
        /// The array of ids of pushed nodes that correspond to the backend ids specified in
        /// backendNodeIds.
        ///</summary>
        [JsonProperty("nodeIds")]
        public long[] NodeIds
        {
            get;
            set;
        }
    }
}