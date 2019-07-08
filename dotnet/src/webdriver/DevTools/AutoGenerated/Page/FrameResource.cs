namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Information about the Resource on the page.
    /// </summary>
    public sealed class FrameResource
    {
        /// <summary>
        /// Resource URL.
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
        public Network.ResourceType Type
        {
            get;
            set;
        }
        /// <summary>
        /// Resource mimeType as determined by the browser.
        ///</summary>
        [JsonProperty("mimeType")]
        public string MimeType
        {
            get;
            set;
        }
        /// <summary>
        /// last-modified timestamp as reported by server.
        ///</summary>
        [JsonProperty("lastModified", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? LastModified
        {
            get;
            set;
        }
        /// <summary>
        /// Resource content size.
        ///</summary>
        [JsonProperty("contentSize", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? ContentSize
        {
            get;
            set;
        }
        /// <summary>
        /// True if the resource failed to load.
        ///</summary>
        [JsonProperty("failed", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Failed
        {
            get;
            set;
        }
        /// <summary>
        /// True if the resource was canceled during loading.
        ///</summary>
        [JsonProperty("canceled", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Canceled
        {
            get;
            set;
        }
    }
}