namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Browser window bounds information
    /// </summary>
    public sealed class Bounds
    {
        /// <summary>
        /// The offset from the left edge of the screen to the window in pixels.
        ///</summary>
        [JsonProperty("left", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Left
        {
            get;
            set;
        }
        /// <summary>
        /// The offset from the top edge of the screen to the window in pixels.
        ///</summary>
        [JsonProperty("top", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Top
        {
            get;
            set;
        }
        /// <summary>
        /// The window width in pixels.
        ///</summary>
        [JsonProperty("width", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Width
        {
            get;
            set;
        }
        /// <summary>
        /// The window height in pixels.
        ///</summary>
        [JsonProperty("height", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Height
        {
            get;
            set;
        }
        /// <summary>
        /// The window state. Default to normal.
        ///</summary>
        [JsonProperty("windowState", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public WindowState? WindowState
        {
            get;
            set;
        }
    }
}