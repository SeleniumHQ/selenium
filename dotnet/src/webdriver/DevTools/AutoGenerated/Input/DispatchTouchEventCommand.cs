namespace OpenQA.Selenium.DevTools.Input
{
    using Newtonsoft.Json;

    /// <summary>
    /// Dispatches a touch event to the page.
    /// </summary>
    public sealed class DispatchTouchEventCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Input.dispatchTouchEvent";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Type of the touch event. TouchEnd and TouchCancel must not contain any touch points, while
        /// TouchStart and TouchMove must contains at least one.
        /// </summary>
        [JsonProperty("type")]
        public string Type
        {
            get;
            set;
        }
        /// <summary>
        /// Active touch points on the touch device. One event per any changed point (compared to
        /// previous touch event in a sequence) is generated, emulating pressing/moving/releasing points
        /// one by one.
        /// </summary>
        [JsonProperty("touchPoints")]
        public TouchPoint[] TouchPoints
        {
            get;
            set;
        }
        /// <summary>
        /// Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8
        /// (default: 0).
        /// </summary>
        [JsonProperty("modifiers", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Modifiers
        {
            get;
            set;
        }
        /// <summary>
        /// Time at which the event occurred.
        /// </summary>
        [JsonProperty("timestamp", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? Timestamp
        {
            get;
            set;
        }
    }

    public sealed class DispatchTouchEventCommandResponse : ICommandResponse<DispatchTouchEventCommandSettings>
    {
    }
}