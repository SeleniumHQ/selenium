namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Source offset and types for a parameter or return value.
    /// </summary>
    public sealed class TypeProfileEntry
    {
        /// <summary>
        /// Source offset of the parameter or end of function for return values.
        ///</summary>
        [JsonProperty("offset")]
        public long Offset
        {
            get;
            set;
        }
        /// <summary>
        /// The types for this parameter or return value.
        ///</summary>
        [JsonProperty("types")]
        public TypeObject[] Types
        {
            get;
            set;
        }
    }
}