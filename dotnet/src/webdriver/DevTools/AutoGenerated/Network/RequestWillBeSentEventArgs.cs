namespace OpenQA.Selenium.DevTools.Network
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when page is about to send HTTP request.
    /// </summary>
    public sealed class RequestWillBeSentEventArgs : EventArgs
    {
        /// <summary>
        /// Request identifier.
        /// </summary>
        [JsonProperty("requestId")]
        public string RequestId
        {
            get;
            set;
        }
        /// <summary>
        /// Loader identifier. Empty string if the request is fetched from worker.
        /// </summary>
        [JsonProperty("loaderId")]
        public string LoaderId
        {
            get;
            set;
        }
        /// <summary>
        /// URL of the document this request is loaded for.
        /// </summary>
        [JsonProperty("documentURL")]
        public string DocumentURL
        {
            get;
            set;
        }
        /// <summary>
        /// Request data.
        /// </summary>
        [JsonProperty("request")]
        public Request Request
        {
            get;
            set;
        }
        /// <summary>
        /// Timestamp.
        /// </summary>
        [JsonProperty("timestamp")]
        public double Timestamp
        {
            get;
            set;
        }
        /// <summary>
        /// Timestamp.
        /// </summary>
        [JsonProperty("wallTime")]
        public double WallTime
        {
            get;
            set;
        }
        /// <summary>
        /// Request initiator.
        /// </summary>
        [JsonProperty("initiator")]
        public Initiator Initiator
        {
            get;
            set;
        }
        /// <summary>
        /// Redirect response data.
        /// </summary>
        [JsonProperty("redirectResponse", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Response RedirectResponse
        {
            get;
            set;
        }
        /// <summary>
        /// Type of this resource.
        /// </summary>
        [JsonProperty("type", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public ResourceType? Type
        {
            get;
            set;
        }
        /// <summary>
        /// Frame identifier.
        /// </summary>
        [JsonProperty("frameId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string FrameId
        {
            get;
            set;
        }
        /// <summary>
        /// Whether the request is initiated by a user gesture. Defaults to false.
        /// </summary>
        [JsonProperty("hasUserGesture", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? HasUserGesture
        {
            get;
            set;
        }
    }
}