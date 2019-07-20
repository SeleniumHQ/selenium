namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Removes attribute with given name from an element with given id.
    /// </summary>
    public sealed class RemoveAttributeCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.removeAttribute";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the element to remove attribute from.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Name of the attribute to remove.
        /// </summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
    }

    public sealed class RemoveAttributeCommandResponse : ICommandResponse<RemoveAttributeCommandSettings>
    {
    }
}