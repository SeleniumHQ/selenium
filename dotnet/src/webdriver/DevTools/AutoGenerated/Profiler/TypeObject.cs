namespace OpenQA.Selenium.DevTools.Profiler
{
    using Newtonsoft.Json;

    /// <summary>
    /// Describes a type collected during runtime.
    /// </summary>
    public sealed class TypeObject
    {
        /// <summary>
        /// Name of a type collected with type profiling.
        ///</summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
    }
}