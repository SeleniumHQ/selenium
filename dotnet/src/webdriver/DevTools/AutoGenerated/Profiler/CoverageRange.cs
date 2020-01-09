namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Coverage data for a source range.
    /// </summary>
    public sealed class CoverageRange
    {
        /// <summary>
        /// JavaScript script source offset for the range start.
        ///</summary>
        [JsonProperty("startOffset")]
        public long StartOffset
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript script source offset for the range end.
        ///</summary>
        [JsonProperty("endOffset")]
        public long EndOffset
        {
            get;
            set;
        }
        /// <summary>
        /// Collected execution count of the source range.
        ///</summary>
        [JsonProperty("count")]
        public long Count
        {
            get;
            set;
        }
    }
}