namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Specifies a number of samples attributed to a certain source position.
    /// </summary>
    public sealed class PositionTickInfo
    {
        /// <summary>
        /// Source line number (1-based).
        ///</summary>
        [JsonProperty("line")]
        public long Line
        {
            get;
            set;
        }
        /// <summary>
        /// Number of samples attributed to the source line.
        ///</summary>
        [JsonProperty("ticks")]
        public long Ticks
        {
            get;
            set;
        }
    }
}