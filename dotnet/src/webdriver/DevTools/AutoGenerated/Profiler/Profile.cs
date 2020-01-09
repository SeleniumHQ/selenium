namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Profile.
    /// </summary>
    public sealed class Profile
    {
        /// <summary>
        /// The list of profile nodes. First item is the root node.
        ///</summary>
        [JsonProperty("nodes")]
        public ProfileNode[] Nodes
        {
            get;
            set;
        }
        /// <summary>
        /// Profiling start timestamp in microseconds.
        ///</summary>
        [JsonProperty("startTime")]
        public double StartTime
        {
            get;
            set;
        }
        /// <summary>
        /// Profiling end timestamp in microseconds.
        ///</summary>
        [JsonProperty("endTime")]
        public double EndTime
        {
            get;
            set;
        }
        /// <summary>
        /// Ids of samples top nodes.
        ///</summary>
        [JsonProperty("samples", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long[] Samples
        {
            get;
            set;
        }
        /// <summary>
        /// Time intervals between adjacent samples in microseconds. The first delta is relative to the
        /// profile startTime.
        ///</summary>
        [JsonProperty("timeDeltas", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long[] TimeDeltas
        {
            get;
            set;
        }
    }
}