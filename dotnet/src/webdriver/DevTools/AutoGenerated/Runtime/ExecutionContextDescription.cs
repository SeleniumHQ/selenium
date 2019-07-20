namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Description of an isolated world.
    /// </summary>
    public sealed class ExecutionContextDescription
    {
        /// <summary>
        /// Unique id of the execution context. It can be used to specify in which execution context
        /// script evaluation should be performed.
        ///</summary>
        [JsonProperty("id")]
        public long Id
        {
            get;
            set;
        }
        /// <summary>
        /// Execution context origin.
        ///</summary>
        [JsonProperty("origin")]
        public string Origin
        {
            get;
            set;
        }
        /// <summary>
        /// Human readable name describing given context.
        ///</summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// Embedder-specific auxiliary data.
        ///</summary>
        [JsonProperty("auxData", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public object AuxData
        {
            get;
            set;
        }
    }
}