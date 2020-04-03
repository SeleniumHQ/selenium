namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Scope description.
    /// </summary>
    public sealed class Scope
    {
        /// <summary>
        /// Scope type.
        ///</summary>
        [JsonProperty("type")]
        public string Type
        {
            get;
            set;
        }
        /// <summary>
        /// Object representing the scope. For `global` and `with` scopes it represents the actual
        /// object; for the rest of the scopes, it is artificial transient object enumerating scope
        /// variables as its properties.
        ///</summary>
        [JsonProperty("object")]
        public Runtime.RemoteObject Object
        {
            get;
            set;
        }
        /// <summary>
        /// name
        ///</summary>
        [JsonProperty("name", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// Location in the source code where scope starts
        ///</summary>
        [JsonProperty("startLocation", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Location StartLocation
        {
            get;
            set;
        }
        /// <summary>
        /// Location in the source code where scope ends
        ///</summary>
        [JsonProperty("endLocation", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Location EndLocation
        {
            get;
            set;
        }
    }
}