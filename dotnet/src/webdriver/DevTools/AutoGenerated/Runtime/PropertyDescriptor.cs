namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Object property descriptor.
    /// </summary>
    public sealed class PropertyDescriptor
    {
        /// <summary>
        /// Property name or symbol description.
        ///</summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// The value associated with the property.
        ///</summary>
        [JsonProperty("value", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public RemoteObject Value
        {
            get;
            set;
        }
        /// <summary>
        /// True if the value associated with the property may be changed (data descriptors only).
        ///</summary>
        [JsonProperty("writable", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Writable
        {
            get;
            set;
        }
        /// <summary>
        /// A function which serves as a getter for the property, or `undefined` if there is no getter
        /// (accessor descriptors only).
        ///</summary>
        [JsonProperty("get", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public RemoteObject Get
        {
            get;
            set;
        }
        /// <summary>
        /// A function which serves as a setter for the property, or `undefined` if there is no setter
        /// (accessor descriptors only).
        ///</summary>
        [JsonProperty("set", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public RemoteObject Set
        {
            get;
            set;
        }
        /// <summary>
        /// True if the type of this property descriptor may be changed and if the property may be
        /// deleted from the corresponding object.
        ///</summary>
        [JsonProperty("configurable")]
        public bool Configurable
        {
            get;
            set;
        }
        /// <summary>
        /// True if this property shows up during enumeration of the properties on the corresponding
        /// object.
        ///</summary>
        [JsonProperty("enumerable")]
        public bool Enumerable
        {
            get;
            set;
        }
        /// <summary>
        /// True if the result was thrown during the evaluation.
        ///</summary>
        [JsonProperty("wasThrown", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? WasThrown
        {
            get;
            set;
        }
        /// <summary>
        /// True if the property is owned for the object.
        ///</summary>
        [JsonProperty("isOwn", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsOwn
        {
            get;
            set;
        }
        /// <summary>
        /// Property symbol object, if the property is of the `symbol` type.
        ///</summary>
        [JsonProperty("symbol", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public RemoteObject Symbol
        {
            get;
            set;
        }
    }
}