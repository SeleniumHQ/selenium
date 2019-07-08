namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Object containing abbreviated remote object value.
    /// </summary>
    public sealed class ObjectPreview
    {
        /// <summary>
        /// Object type.
        ///</summary>
        [JsonProperty("type")]
        public string Type
        {
            get;
            set;
        }
        /// <summary>
        /// Object subtype hint. Specified for `object` type values only.
        ///</summary>
        [JsonProperty("subtype", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Subtype
        {
            get;
            set;
        }
        /// <summary>
        /// String representation of the object.
        ///</summary>
        [JsonProperty("description", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Description
        {
            get;
            set;
        }
        /// <summary>
        /// True iff some of the properties or entries of the original object did not fit.
        ///</summary>
        [JsonProperty("overflow")]
        public bool Overflow
        {
            get;
            set;
        }
        /// <summary>
        /// List of the properties.
        ///</summary>
        [JsonProperty("properties")]
        public PropertyPreview[] Properties
        {
            get;
            set;
        }
        /// <summary>
        /// List of the entries. Specified for `map` and `set` subtype values only.
        ///</summary>
        [JsonProperty("entries", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public EntryPreview[] Entries
        {
            get;
            set;
        }
    }
}