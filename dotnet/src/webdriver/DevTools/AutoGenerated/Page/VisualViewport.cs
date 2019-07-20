namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Visual viewport position, dimensions, and scale.
    /// </summary>
    public sealed class VisualViewport
    {
        /// <summary>
        /// Horizontal offset relative to the layout viewport (CSS pixels).
        ///</summary>
        [JsonProperty("offsetX")]
        public double OffsetX
        {
            get;
            set;
        }
        /// <summary>
        /// Vertical offset relative to the layout viewport (CSS pixels).
        ///</summary>
        [JsonProperty("offsetY")]
        public double OffsetY
        {
            get;
            set;
        }
        /// <summary>
        /// Horizontal offset relative to the document (CSS pixels).
        ///</summary>
        [JsonProperty("pageX")]
        public double PageX
        {
            get;
            set;
        }
        /// <summary>
        /// Vertical offset relative to the document (CSS pixels).
        ///</summary>
        [JsonProperty("pageY")]
        public double PageY
        {
            get;
            set;
        }
        /// <summary>
        /// Width (CSS pixels), excludes scrollbar if present.
        ///</summary>
        [JsonProperty("clientWidth")]
        public double ClientWidth
        {
            get;
            set;
        }
        /// <summary>
        /// Height (CSS pixels), excludes scrollbar if present.
        ///</summary>
        [JsonProperty("clientHeight")]
        public double ClientHeight
        {
            get;
            set;
        }
        /// <summary>
        /// Scale relative to the ideal viewport (size at width=device-width).
        ///</summary>
        [JsonProperty("scale")]
        public double Scale
        {
            get;
            set;
        }
        /// <summary>
        /// Page zoom factor (CSS to device independent pixels ratio).
        ///</summary>
        [JsonProperty("zoom", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? Zoom
        {
            get;
            set;
        }
    }
}