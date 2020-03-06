namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Box model.
    /// </summary>
    public sealed class BoxModel
    {
        /// <summary>
        /// Content box
        ///</summary>
        [JsonProperty("content")]
        public double[] Content
        {
            get;
            set;
        }
        /// <summary>
        /// Padding box
        ///</summary>
        [JsonProperty("padding")]
        public double[] Padding
        {
            get;
            set;
        }
        /// <summary>
        /// Border box
        ///</summary>
        [JsonProperty("border")]
        public double[] Border
        {
            get;
            set;
        }
        /// <summary>
        /// Margin box
        ///</summary>
        [JsonProperty("margin")]
        public double[] Margin
        {
            get;
            set;
        }
        /// <summary>
        /// Node width
        ///</summary>
        [JsonProperty("width")]
        public long Width
        {
            get;
            set;
        }
        /// <summary>
        /// Node height
        ///</summary>
        [JsonProperty("height")]
        public long Height
        {
            get;
            set;
        }
        /// <summary>
        /// Shape outside coordinates
        ///</summary>
        [JsonProperty("shapeOutside", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ShapeOutsideInfo ShapeOutside
        {
            get;
            set;
        }
    }
}