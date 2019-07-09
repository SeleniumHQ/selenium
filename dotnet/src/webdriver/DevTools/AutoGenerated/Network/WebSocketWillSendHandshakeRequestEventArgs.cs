namespace OpenQA.Selenium.DevTools.Network
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when WebSocket is about to initiate handshake.
    /// </summary>
    public sealed class WebSocketWillSendHandshakeRequestEventArgs : EventArgs
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
        /// Timestamp.
        /// </summary>
        [JsonProperty("timestamp")]
        public double Timestamp
        {
            get;
            set;
        }
        /// <summary>
        /// UTC Timestamp.
        /// </summary>
        [JsonProperty("wallTime")]
        public double WallTime
        {
            get;
            set;
        }
        /// <summary>
        /// WebSocket request data.
        /// </summary>
        [JsonProperty("request")]
        public WebSocketRequest Request
        {
            get;
            set;
        }
    }
}