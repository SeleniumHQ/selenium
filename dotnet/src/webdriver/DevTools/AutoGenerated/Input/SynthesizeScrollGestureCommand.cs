namespace OpenQA.Selenium.DevTools.Input
{
    using Newtonsoft.Json;

    /// <summary>
    /// Synthesizes a scroll gesture over a time period by issuing appropriate touch events.
    /// </summary>
    public sealed class SynthesizeScrollGestureCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Input.synthesizeScrollGesture";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// X coordinate of the start of the gesture in CSS pixels.
        /// </summary>
        [JsonProperty("x")]
        public double X
        {
            get;
            set;
        }
        /// <summary>
        /// Y coordinate of the start of the gesture in CSS pixels.
        /// </summary>
        [JsonProperty("y")]
        public double Y
        {
            get;
            set;
        }
        /// <summary>
        /// The distance to scroll along the X axis (positive to scroll left).
        /// </summary>
        [JsonProperty("xDistance", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? XDistance
        {
            get;
            set;
        }
        /// <summary>
        /// The distance to scroll along the Y axis (positive to scroll up).
        /// </summary>
        [JsonProperty("yDistance", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? YDistance
        {
            get;
            set;
        }
        /// <summary>
        /// The number of additional pixels to scroll back along the X axis, in addition to the given
        /// distance.
        /// </summary>
        [JsonProperty("xOverscroll", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? XOverscroll
        {
            get;
            set;
        }
        /// <summary>
        /// The number of additional pixels to scroll back along the Y axis, in addition to the given
        /// distance.
        /// </summary>
        [JsonProperty("yOverscroll", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? YOverscroll
        {
            get;
            set;
        }
        /// <summary>
        /// Prevent fling (default: true).
        /// </summary>
        [JsonProperty("preventFling", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? PreventFling
        {
            get;
            set;
        }
        /// <summary>
        /// Swipe speed in pixels per second (default: 800).
        /// </summary>
        [JsonProperty("speed", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Speed
        {
            get;
            set;
        }
        /// <summary>
        /// Which type of input events to be generated (default: 'default', which queries the platform
        /// for the preferred input type).
        /// </summary>
        [JsonProperty("gestureSourceType", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public GestureSourceType? GestureSourceType
        {
            get;
            set;
        }
        /// <summary>
        /// The number of times to repeat the gesture (default: 0).
        /// </summary>
        [JsonProperty("repeatCount", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? RepeatCount
        {
            get;
            set;
        }
        /// <summary>
        /// The number of milliseconds delay between each repeat. (default: 250).
        /// </summary>
        [JsonProperty("repeatDelayMs", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? RepeatDelayMs
        {
            get;
            set;
        }
        /// <summary>
        /// The name of the interaction markers to generate, if not empty (default: "").
        /// </summary>
        [JsonProperty("interactionMarkerName", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string InteractionMarkerName
        {
            get;
            set;
        }
    }

    public sealed class SynthesizeScrollGestureCommandResponse : ICommandResponse<SynthesizeScrollGestureCommandSettings>
    {
    }
}