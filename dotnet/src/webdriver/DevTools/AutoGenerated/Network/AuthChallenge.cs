namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Authorization challenge for HTTP status code 401 or 407.
    /// </summary>
    public sealed class AuthChallenge
    {
        /// <summary>
        /// Source of the authentication challenge.
        ///</summary>
        [JsonProperty("source", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Source
        {
            get;
            set;
        }
        /// <summary>
        /// Origin of the challenger.
        ///</summary>
        [JsonProperty("origin")]
        public string Origin
        {
            get;
            set;
        }
        /// <summary>
        /// The authentication scheme used, such as basic or digest
        ///</summary>
        [JsonProperty("scheme")]
        public string Scheme
        {
            get;
            set;
        }
        /// <summary>
        /// The realm of the challenge. May be empty.
        ///</summary>
        [JsonProperty("realm")]
        public string Realm
        {
            get;
            set;
        }
    }
}