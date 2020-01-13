namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// HTTP response data.
    /// </summary>
    public sealed class Response
    {
        /// <summary>
        /// Response URL. This URL can be different from CachedResource.url in case of redirect.
        ///</summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// HTTP response status code.
        ///</summary>
        [JsonProperty("status")]
        public long Status
        {
            get;
            set;
        }
        /// <summary>
        /// HTTP response status text.
        ///</summary>
        [JsonProperty("statusText")]
        public string StatusText
        {
            get;
            set;
        }
        /// <summary>
        /// HTTP response headers.
        ///</summary>
        [JsonProperty("headers")]
        public Headers Headers
        {
            get;
            set;
        }
        /// <summary>
        /// HTTP response headers text.
        ///</summary>
        [JsonProperty("headersText", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string HeadersText
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
        /// Refined HTTP request headers that were actually transmitted over the network.
        ///</summary>
        [JsonProperty("requestHeaders", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Headers RequestHeaders
        {
            get;
            set;
        }
        /// <summary>
        /// HTTP request headers text.
        ///</summary>
        [JsonProperty("requestHeadersText", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string RequestHeadersText
        {
            get;
            set;
        }
        /// <summary>
        /// Specifies whether physical connection was actually reused for this request.
        ///</summary>
        [JsonProperty("connectionReused")]
        public bool ConnectionReused
        {
            get;
            set;
        }
        /// <summary>
        /// Physical connection id that was actually used for this request.
        ///</summary>
        [JsonProperty("connectionId")]
        public double ConnectionId
        {
            get;
            set;
        }
        /// <summary>
        /// Remote IP address.
        ///</summary>
        [JsonProperty("remoteIPAddress", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string RemoteIPAddress
        {
            get;
            set;
        }
        /// <summary>
        /// Remote port.
        ///</summary>
        [JsonProperty("remotePort", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? RemotePort
        {
            get;
            set;
        }
        /// <summary>
        /// Specifies that the request was served from the disk cache.
        ///</summary>
        [JsonProperty("fromDiskCache", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? FromDiskCache
        {
            get;
            set;
        }
        /// <summary>
        /// Specifies that the request was served from the ServiceWorker.
        ///</summary>
        [JsonProperty("fromServiceWorker", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? FromServiceWorker
        {
            get;
            set;
        }
        /// <summary>
        /// Total number of bytes received for this request so far.
        ///</summary>
        [JsonProperty("encodedDataLength")]
        public double EncodedDataLength
        {
            get;
            set;
        }
        /// <summary>
        /// Timing information for the given request.
        ///</summary>
        [JsonProperty("timing", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ResourceTiming Timing
        {
            get;
            set;
        }
        /// <summary>
        /// Protocol used to fetch this request.
        ///</summary>
        [JsonProperty("protocol", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Protocol
        {
            get;
            set;
        }
        /// <summary>
        /// Security state of the request resource.
        ///</summary>
        [JsonProperty("securityState")]
        public Security.SecurityState SecurityState
        {
            get;
            set;
        }
        /// <summary>
        /// Security details for the request.
        ///</summary>
        [JsonProperty("securityDetails", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public SecurityDetails SecurityDetails
        {
            get;
            set;
        }
    }
}