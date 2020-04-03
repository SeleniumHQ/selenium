namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Get position and size of the browser window.
    /// </summary>
    public sealed class GetWindowBoundsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Browser.getWindowBounds";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Browser window id.
        /// </summary>
        [JsonProperty("windowId")]
        public long WindowId
        {
            get;
            set;
        }
    }

    public sealed class GetWindowBoundsCommandResponse : ICommandResponse<GetWindowBoundsCommandSettings>
    {
        /// <summary>
        /// Bounds information of the window. When window state is 'minimized', the restored window
        /// position and size are returned.
        ///</summary>
        [JsonProperty("bounds")]
        public Bounds Bounds
        {
            get;
            set;
        }
    }
}