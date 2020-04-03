namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns present frame / resource tree structure.
    /// </summary>
    public sealed class GetResourceTreeCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.getResourceTree";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetResourceTreeCommandResponse : ICommandResponse<GetResourceTreeCommandSettings>
    {
        /// <summary>
        /// Present frame / resource tree structure.
        ///</summary>
        [JsonProperty("frameTree")]
        public FrameResourceTree FrameTree
        {
            get;
            set;
        }
    }
}