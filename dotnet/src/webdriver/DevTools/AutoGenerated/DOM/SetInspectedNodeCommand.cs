namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enables console to refer to the node with given id via $x (see Command Line API for more details
    /// $x functions).
    /// </summary>
    public sealed class SetInspectedNodeCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.setInspectedNode";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// DOM node id to be accessible by means of $x command line API.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
    }

    public sealed class SetInspectedNodeCommandResponse : ICommandResponse<SetInspectedNodeCommandSettings>
    {
    }
}