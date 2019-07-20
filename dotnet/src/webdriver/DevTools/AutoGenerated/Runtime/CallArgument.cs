namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Represents function call argument. Either remote object id `objectId`, primitive `value`,
    /// unserializable primitive value or neither of (for undefined) them should be specified.
    /// </summary>
    public sealed class CallArgument
    {
        /// <summary>
        /// Primitive value or serializable javascript object.
        ///</summary>
        [JsonProperty("value", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public object Value
        {
            get;
            set;
        }
        /// <summary>
        /// Primitive value which can not be JSON-stringified.
        ///</summary>
        [JsonProperty("unserializableValue", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string UnserializableValue
        {
            get;
            set;
        }
        /// <summary>
        /// Remote object handle.
        ///</summary>
        [JsonProperty("objectId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ObjectId
        {
            get;
            set;
        }
    }
}