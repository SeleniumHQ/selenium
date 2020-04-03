namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Chrome histogram bucket.
    /// </summary>
    public sealed class Bucket
    {
        /// <summary>
        /// Minimum value (inclusive).
        ///</summary>
        [JsonProperty("low")]
        public long Low
        {
            get;
            set;
        }
        /// <summary>
        /// Maximum value (exclusive).
        ///</summary>
        [JsonProperty("high")]
        public long High
        {
            get;
            set;
        }
        /// <summary>
        /// Number of samples.
        ///</summary>
        [JsonProperty("count")]
        public long Count
        {
            get;
            set;
        }
    }
}