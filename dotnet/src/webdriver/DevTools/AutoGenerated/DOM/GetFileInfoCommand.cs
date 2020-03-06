namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns file information for the given
    /// File wrapper.
    /// </summary>
    public sealed class GetFileInfoCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.getFileInfo";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// JavaScript object id of the node wrapper.
        /// </summary>
        [JsonProperty("objectId")]
        public string ObjectId
        {
            get;
            set;
        }
    }

    public sealed class GetFileInfoCommandResponse : ICommandResponse<GetFileInfoCommandSettings>
    {
        /// <summary>
        /// Gets or sets the path
        /// </summary>
        [JsonProperty("path")]
        public string Path
        {
            get;
            set;
        }
    }
}