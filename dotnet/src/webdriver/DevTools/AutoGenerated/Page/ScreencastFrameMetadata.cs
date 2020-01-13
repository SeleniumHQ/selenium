namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Screencast frame metadata.
    /// </summary>
    public sealed class ScreencastFrameMetadata
    {
        /// <summary>
        /// Top offset in DIP.
        ///</summary>
        [JsonProperty("offsetTop")]
        public double OffsetTop
        {
            get;
            set;
        }
        /// <summary>
        /// Page scale factor.
        ///</summary>
        [JsonProperty("pageScaleFactor")]
        public double PageScaleFactor
        {
            get;
            set;
        }
        /// <summary>
        /// Device screen width in DIP.
        ///</summary>
        [JsonProperty("deviceWidth")]
        public double DeviceWidth
        {
            get;
            set;
        }
        /// <summary>
        /// Device screen height in DIP.
        ///</summary>
        [JsonProperty("deviceHeight")]
        public double DeviceHeight
        {
            get;
            set;
        }
        /// <summary>
        /// Position of horizontal scroll in CSS pixels.
        ///</summary>
        [JsonProperty("scrollOffsetX")]
        public double ScrollOffsetX
        {
            get;
            set;
        }
        /// <summary>
        /// Position of vertical scroll in CSS pixels.
        ///</summary>
        [JsonProperty("scrollOffsetY")]
        public double ScrollOffsetY
        {
            get;
            set;
        }
        /// <summary>
        /// Frame swap timestamp.
        ///</summary>
        [JsonProperty("timestamp", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? Timestamp
        {
            get;
            set;
        }
    }
}