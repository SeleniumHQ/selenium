namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// CSS Shape Outside details.
    /// </summary>
    public sealed class ShapeOutsideInfo
    {
        /// <summary>
        /// Shape bounds
        ///</summary>
        [JsonProperty("bounds")]
        public double[] Bounds
        {
            get;
            set;
        }
        /// <summary>
        /// Shape coordinate details
        ///</summary>
        [JsonProperty("shape")]
        public object[] Shape
        {
            get;
            set;
        }
        /// <summary>
        /// Margin shape bounds
        ///</summary>
        [JsonProperty("marginShape")]
        public object[] MarginShape
        {
            get;
            set;
        }
    }
}