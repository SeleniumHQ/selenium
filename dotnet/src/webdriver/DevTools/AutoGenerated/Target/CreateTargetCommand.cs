namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// Creates a new page.
    /// </summary>
    public sealed class CreateTargetCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Target.createTarget";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// The initial URL the page will be navigated to.
        /// </summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Frame width in DIP (headless chrome only).
        /// </summary>
        [JsonProperty("width", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Width
        {
            get;
            set;
        }
        /// <summary>
        /// Frame height in DIP (headless chrome only).
        /// </summary>
        [JsonProperty("height", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Height
        {
            get;
            set;
        }
        /// <summary>
        /// The browser context to create the page in.
        /// </summary>
        [JsonProperty("browserContextId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string BrowserContextId
        {
            get;
            set;
        }
        /// <summary>
        /// Whether BeginFrames for this target will be controlled via DevTools (headless chrome only,
        /// not supported on MacOS yet, false by default).
        /// </summary>
        [JsonProperty("enableBeginFrameControl", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? EnableBeginFrameControl
        {
            get;
            set;
        }

        [JsonProperty("newWindow", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? NewWindow
        {
            get;
            set;
        }

        [JsonProperty("background", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Background
        {
            get;
            set;
        }
    }

    public sealed class CreateTargetCommandResponse : ICommandResponse<CreateTargetCommandSettings>
    {
        /// <summary>
        /// The id of the page opened.
        ///</summary>
        [JsonProperty("targetId")]
        public string TargetId
        {
            get;
            set;
        }
    }
}
