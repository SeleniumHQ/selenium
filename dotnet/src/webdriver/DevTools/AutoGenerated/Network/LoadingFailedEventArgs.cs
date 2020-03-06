namespace OpenQA.Selenium.DevTools.Network
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when HTTP request has failed to load.
    /// </summary>
    public sealed class LoadingFailedEventArgs : EventArgs
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
        /// Resource type.
        /// </summary>
        [JsonProperty("type")]
        public ResourceType Type
        {
            get;
            set;
        }
        /// <summary>
        /// User friendly error message.
        /// </summary>
        [JsonProperty("errorText")]
        public string ErrorText
        {
            get;
            set;
        }
        /// <summary>
        /// True if loading was canceled.
        /// </summary>
        [JsonProperty("canceled", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? Canceled
        {
            get;
            set;
        }
        /// <summary>
        /// The reason why loading was blocked, if any.
        /// </summary>
        [JsonProperty("blockedReason", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public BlockedReason? BlockedReason
        {
            get;
            set;
        }
    }
}