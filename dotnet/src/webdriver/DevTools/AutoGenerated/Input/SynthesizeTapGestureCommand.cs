namespace OpenQA.Selenium.DevTools.Input
{
    using Newtonsoft.Json;

    /// <summary>
    /// Synthesizes a tap gesture over a time period by issuing appropriate touch events.
    /// </summary>
    public sealed class SynthesizeTapGestureCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Input.synthesizeTapGesture";
        
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
        /// Duration between touchdown and touchup events in ms (default: 50).
        /// </summary>
        [JsonProperty("duration", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? Duration
        {
            get;
            set;
        }
        /// <summary>
        /// Number of times to perform the tap (e.g. 2 for double tap, default: 1).
        /// </summary>
        [JsonProperty("tapCount", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? TapCount
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
    }

    public sealed class SynthesizeTapGestureCommandResponse : ICommandResponse<SynthesizeTapGestureCommandSettings>
    {
    }
}