namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// A structure holding an RGBA color.
    /// </summary>
    public sealed class RGBA
    {
        /// <summary>
        /// The red component, in the [0-255] range.
        ///</summary>
        [JsonProperty("r")]
        public long R
        {
            get;
            set;
        }
        /// <summary>
        /// The green component, in the [0-255] range.
        ///</summary>
        [JsonProperty("g")]
        public long G
        {
            get;
            set;
        }
        /// <summary>
        /// The blue component, in the [0-255] range.
        ///</summary>
        [JsonProperty("b")]
        public long B
        {
            get;
            set;
        }
        /// <summary>
        /// The alpha component, in the [0-1] range (default: 1).
        ///</summary>
        [JsonProperty("a", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? A
        {
            get;
            set;
        }
    }
}