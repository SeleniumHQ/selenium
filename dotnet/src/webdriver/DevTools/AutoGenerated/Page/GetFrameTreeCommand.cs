namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns present frame tree structure.
    /// </summary>
    public sealed class GetFrameTreeCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.getFrameTree";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetFrameTreeCommandResponse : ICommandResponse<GetFrameTreeCommandSettings>
    {
        /// <summary>
        /// Present frame tree structure.
        ///</summary>
        [JsonProperty("frameTree")]
        public FrameTree FrameTree
        {
            get;
            set;
        }
    }
}