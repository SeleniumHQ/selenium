namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Rectangle.
    /// </summary>
    public sealed class Rect
    {
        /// <summary>
        /// X coordinate
        ///</summary>
        [JsonProperty("x")]
        public double X
        {
            get;
            set;
        }
        /// <summary>
        /// Y coordinate
        ///</summary>
        [JsonProperty("y")]
        public double Y
        {
            get;
            set;
        }
        /// <summary>
        /// Rectangle width
        ///</summary>
        [JsonProperty("width")]
        public double Width
        {
            get;
            set;
        }
        /// <summary>
        /// Rectangle height
        ///</summary>
        [JsonProperty("height")]
        public double Height
        {
            get;
            set;
        }
    }
}