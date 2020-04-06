namespace OpenQA.Selenium.DevTools.Network
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired upon WebSocket creation.
    /// </summary>
    public sealed class WebSocketCreatedEventArgs : EventArgs
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
        /// WebSocket request URL.
        /// </summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Request initiator.
        /// </summary>
        [JsonProperty("initiator", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Initiator Initiator
        {
            get;
            set;
        }
    }
}