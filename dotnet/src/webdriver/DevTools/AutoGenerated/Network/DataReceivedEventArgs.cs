namespace OpenQA.Selenium.DevTools.Network
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when data chunk was received over the network.
    /// </summary>
    public sealed class DataReceivedEventArgs : EventArgs
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
        /// Data chunk length.
        /// </summary>
        [JsonProperty("dataLength")]
        public long DataLength
        {
            get;
            set;
        }
        /// <summary>
        /// Actual bytes received (might be less than dataLength for compressed encodings).
        /// </summary>
        [JsonProperty("encodedDataLength")]
        public long EncodedDataLength
        {
            get;
            set;
        }
    }
}