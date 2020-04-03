namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Profile node. Holds callsite information, execution statistics and child nodes.
    /// </summary>
    public sealed class ProfileNode
    {
        /// <summary>
        /// Unique id of the node.
        ///</summary>
        [JsonProperty("id")]
        public long Id
        {
            get;
            set;
        }
        /// <summary>
        /// Function location.
        ///</summary>
        [JsonProperty("callFrame")]
        public Runtime.CallFrame CallFrame
        {
            get;
            set;
        }
        /// <summary>
        /// Number of samples where this node was on top of the call stack.
        ///</summary>
        [JsonProperty("hitCount", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? HitCount
        {
            get;
            set;
        }
        /// <summary>
        /// Child node ids.
        ///</summary>
        [JsonProperty("children", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long[] Children
        {
            get;
            set;
        }
        /// <summary>
        /// The reason of being not optimized. The function may be deoptimized or marked as don't
        /// optimize.
        ///</summary>
        [JsonProperty("deoptReason", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string DeoptReason
        {
            get;
            set;
        }
        /// <summary>
        /// An array of source position ticks.
        ///</summary>
        [JsonProperty("positionTicks", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public PositionTickInfo[] PositionTicks
        {
            get;
            set;
        }
    }
}