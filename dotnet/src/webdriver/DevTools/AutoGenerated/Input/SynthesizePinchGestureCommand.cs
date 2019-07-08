namespace OpenQA.Selenium.DevTools.Input
{
    using Newtonsoft.Json;

    /// <summary>
    /// Synthesizes a pinch gesture over a time period by issuing appropriate touch events.
    /// </summary>
    public sealed class SynthesizePinchGestureCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Input.synthesizePinchGesture";
        
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
        /// Relative scale factor after zooming (>1.0 zooms in, <1.0 zooms out).
        /// </summary>
        [JsonProperty("scaleFactor")]
        public double ScaleFactor
        {
            get;
            set;
        }
        /// <summary>
        /// Relative pointer speed in pixels per second (default: 800).
        /// </summary>
        [JsonProperty("relativeSpeed", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? RelativeSpeed
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

    public sealed class SynthesizePinchGestureCommandResponse : ICommandResponse<SynthesizePinchGestureCommandSettings>
    {
    }
}