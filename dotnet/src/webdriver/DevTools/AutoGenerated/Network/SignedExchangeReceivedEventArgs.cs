namespace OpenQA.Selenium.DevTools.Network
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when a signed exchange was received over the network
    /// </summary>
    public sealed class SignedExchangeReceivedEventArgs : EventArgs
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
        /// Information about the signed exchange response.
        /// </summary>
        [JsonProperty("info")]
        public SignedExchangeInfo Info
        {
            get;
            set;
        }
    }
}