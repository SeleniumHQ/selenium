namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Object private field descriptor.
    /// </summary>
    public sealed class PrivatePropertyDescriptor
    {
        /// <summary>
        /// Private property name.
        ///</summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// The value associated with the private property.
        ///</summary>
        [JsonProperty("value")]
        public RemoteObject Value
        {
            get;
            set;
        }
    }
}