namespace OpenQA.Selenium.DevTools.Network
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when WebSocket handshake response becomes available.
    /// </summary>
    public sealed class WebSocketHandshakeResponseReceivedEventArgs : EventArgs
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
        /// WebSocket response data.
        /// </summary>
        [JsonProperty("response")]
        public WebSocketResponse Response
        {
            get;
            set;
        }
    }
}