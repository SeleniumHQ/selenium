namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets node HTML markup, returns new node id.
    /// </summary>
    public sealed class SetOuterHTMLCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.setOuterHTML";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the node to set markup for.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Outer HTML markup to set.
        /// </summary>
        [JsonProperty("outerHTML")]
        public string OuterHTML
        {
            get;
            set;
        }
    }

    public sealed class SetOuterHTMLCommandResponse : ICommandResponse<SetOuterHTMLCommandSettings>
    {
    }
}