namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Viewport for capturing screenshot.
    /// </summary>
    public sealed class Viewport
    {
        /// <summary>
        /// X offset in device independent pixels (dip).
        ///</summary>
        [JsonProperty("x")]
        public double X
        {
            get;
            set;
        }
        /// <summary>
        /// Y offset in device independent pixels (dip).
        ///</summary>
        [JsonProperty("y")]
        public double Y
        {
            get;
            set;
        }
        /// <summary>
        /// Rectangle width in device independent pixels (dip).
        ///</summary>
        [JsonProperty("width")]
        public double Width
        {
            get;
            set;
        }
        /// <summary>
        /// Rectangle height in device independent pixels (dip).
        ///</summary>
        [JsonProperty("height")]
        public double Height
        {
            get;
            set;
        }
        /// <summary>
        /// Page scale factor.
        ///</summary>
        [JsonProperty("scale")]
        public double Scale
        {
            get;
            set;
        }
    }
}