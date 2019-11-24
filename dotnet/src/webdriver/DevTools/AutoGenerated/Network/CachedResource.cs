namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Information about the cached resource.
    /// </summary>
    public sealed class CachedResource
    {
        /// <summary>
        /// Resource URL. This is the url of the original network request.
        ///</summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Type of this resource.
        ///</summary>
        [JsonProperty("type")]
        public ResourceType Type
        {
            get;
            set;
        }
        /// <summary>
        /// Cached response data.
        ///</summary>
        [JsonProperty("response", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Response Response
        {
            get;
            set;
        }
        /// <summary>
        /// Cached response body size.
        ///</summary>
        [JsonProperty("bodySize")]
        public double BodySize
        {
            get;
            set;
        }
    }
}