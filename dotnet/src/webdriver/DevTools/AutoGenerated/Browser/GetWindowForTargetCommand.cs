namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Get the browser window that contains the devtools target.
    /// </summary>
    public sealed class GetWindowForTargetCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Browser.getWindowForTarget";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Devtools agent host id. If called as a part of the session, associated targetId is used.
        /// </summary>
        [JsonProperty("targetId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string TargetId
        {
            get;
            set;
        }
    }

    public sealed class GetWindowForTargetCommandResponse : ICommandResponse<GetWindowForTargetCommandSettings>
    {
        /// <summary>
        /// Browser window id.
        ///</summary>
        [JsonProperty("windowId")]
        public long WindowId
        {
            get;
            set;
        }
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