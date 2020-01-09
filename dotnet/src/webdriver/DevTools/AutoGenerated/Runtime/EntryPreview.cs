namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// EntryPreview
    /// </summary>
    public sealed class EntryPreview
    {
        /// <summary>
        /// Preview of the key. Specified for map-like collection entries.
        ///</summary>
        [JsonProperty("key", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ObjectPreview Key
        {
            get;
            set;
        }
        /// <summary>
        /// Preview of the value.
        ///</summary>
        [JsonProperty("value")]
        public ObjectPreview Value
        {
            get;
            set;
        }
    }
}