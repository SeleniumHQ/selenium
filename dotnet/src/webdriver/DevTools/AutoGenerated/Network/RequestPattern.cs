namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Request pattern for interception.
    /// </summary>
    public sealed class RequestPattern
    {
        /// <summary>
        /// Wildcards ('*' -> zero or more, '?' -> exactly one) are allowed. Escape character is
        /// backslash. Omitting is equivalent to "*".
        ///</summary>
        [JsonProperty("urlPattern", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string UrlPattern
        {
            get;
            set;
        }
        /// <summary>
        /// If set, only requests for matching resource types will be intercepted.
        ///</summary>
        [JsonProperty("resourceType", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ResourceType? ResourceType
        {
            get;
            set;
        }
        /// <summary>
        /// Stage at wich to begin intercepting requests. Default is Request.
        ///</summary>
        [JsonProperty("interceptionStage", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public InterceptionStage? InterceptionStage
        {
            get;
            set;
        }
    }
}