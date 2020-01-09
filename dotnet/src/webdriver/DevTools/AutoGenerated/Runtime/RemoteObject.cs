namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Mirror object referencing original JavaScript object.
    /// </summary>
    public sealed class RemoteObject
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
        /// Object class (constructor) name. Specified for `object` type values only.
        ///</summary>
        [JsonProperty("className", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ClassName
        {
            get;
            set;
        }
        /// <summary>
        /// Remote object value in case of primitive values or JSON values (if it was requested).
        ///</summary>
        [JsonProperty("value", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public object Value
        {
            get;
            set;
        }
        /// <summary>
        /// Primitive value which can not be JSON-stringified does not have `value`, but gets this
        /// property.
        ///</summary>
        [JsonProperty("unserializableValue", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string UnserializableValue
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
        /// Unique object identifier (for non-primitive values).
        ///</summary>
        [JsonProperty("objectId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ObjectId
        {
            get;
            set;
        }
        /// <summary>
        /// Preview containing abbreviated property values. Specified for `object` type values only.
        ///</summary>
        [JsonProperty("preview", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ObjectPreview Preview
        {
            get;
            set;
        }
        /// <summary>
        /// customPreview
        ///</summary>
        [JsonProperty("customPreview", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public CustomPreview CustomPreview
        {
            get;
            set;
        }
    }
}