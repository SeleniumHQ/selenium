namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Starts sending each frame using the `screencastFrame` event.
    /// </summary>
    public sealed class StartScreencastCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.startScreencast";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Image compression format.
        /// </summary>
        [JsonProperty("format", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Format
        {
            get;
            set;
        }
        /// <summary>
        /// Compression quality from range [0..100].
        /// </summary>
        [JsonProperty("quality", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Quality
        {
            get;
            set;
        }
        /// <summary>
        /// Maximum screenshot width.
        /// </summary>
        [JsonProperty("maxWidth", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? MaxWidth
        {
            get;
            set;
        }
        /// <summary>
        /// Maximum screenshot height.
        /// </summary>
        [JsonProperty("maxHeight", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? MaxHeight
        {
            get;
            set;
        }
        /// <summary>
        /// Send every n-th frame.
        /// </summary>
        [JsonProperty("everyNthFrame", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? EveryNthFrame
        {
            get;
            set;
        }
    }

    public sealed class StartScreencastCommandResponse : ICommandResponse<StartScreencastCommandSettings>
    {
    }
}