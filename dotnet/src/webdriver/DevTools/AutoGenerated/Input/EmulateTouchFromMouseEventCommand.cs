namespace OpenQA.Selenium.DevTools.Input
{
    using Newtonsoft.Json;

    /// <summary>
    /// Emulates touch event from the mouse event parameters.
    /// </summary>
    public sealed class EmulateTouchFromMouseEventCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Input.emulateTouchFromMouseEvent";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Type of the mouse event.
        /// </summary>
        [JsonProperty("type")]
        public string Type
        {
            get;
            set;
        }
        /// <summary>
        /// X coordinate of the mouse pointer in DIP.
        /// </summary>
        [JsonProperty("x")]
        public long X
        {
            get;
            set;
        }
        /// <summary>
        /// Y coordinate of the mouse pointer in DIP.
        /// </summary>
        [JsonProperty("y")]
        public long Y
        {
            get;
            set;
        }
        /// <summary>
        /// Mouse button.
        /// </summary>
        [JsonProperty("button")]
        public string Button
        {
            get;
            set;
        }
        /// <summary>
        /// Time at which the event occurred (default: current time).
        /// </summary>
        [JsonProperty("timestamp", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? Timestamp
        {
            get;
            set;
        }
        /// <summary>
        /// X delta in DIP for mouse wheel event (default: 0).
        /// </summary>
        [JsonProperty("deltaX", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? DeltaX
        {
            get;
            set;
        }
        /// <summary>
        /// Y delta in DIP for mouse wheel event (default: 0).
        /// </summary>
        [JsonProperty("deltaY", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? DeltaY
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
        /// Number of times the mouse button was clicked (default: 0).
        /// </summary>
        [JsonProperty("clickCount", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? ClickCount
        {
            get;
            set;
        }
    }

    public sealed class EmulateTouchFromMouseEventCommandResponse : ICommandResponse<EmulateTouchFromMouseEventCommandSettings>
    {
    }
}