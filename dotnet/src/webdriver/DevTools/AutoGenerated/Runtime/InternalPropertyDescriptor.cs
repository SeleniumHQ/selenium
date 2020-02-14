namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Object internal property descriptor. This property isn't normally visible in JavaScript code.
    /// </summary>
    public sealed class InternalPropertyDescriptor
    {
        /// <summary>
        /// Conventional property name.
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
    }
}