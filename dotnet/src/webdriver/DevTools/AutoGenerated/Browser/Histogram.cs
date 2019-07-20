namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Chrome histogram.
    /// </summary>
    public sealed class Histogram
    {
        /// <summary>
        /// Name.
        ///</summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// Sum of sample values.
        ///</summary>
        [JsonProperty("sum")]
        public long Sum
        {
            get;
            set;
        }
        /// <summary>
        /// Total number of samples.
        ///</summary>
        [JsonProperty("count")]
        public long Count
        {
            get;
            set;
        }
        /// <summary>
        /// Buckets.
        ///</summary>
        [JsonProperty("buckets")]
        public Bucket[] Buckets
        {
            get;
            set;
        }
    }
}