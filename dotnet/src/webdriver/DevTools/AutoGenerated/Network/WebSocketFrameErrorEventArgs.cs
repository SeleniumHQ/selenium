namespace OpenQA.Selenium.DevTools.Network
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when WebSocket message error occurs.
    /// </summary>
    public sealed class WebSocketFrameErrorEventArgs : EventArgs
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
        /// WebSocket error message.
        /// </summary>
        [JsonProperty("errorMessage")]
        public string ErrorMessage
        {
            get;
            set;
        }
    }
}