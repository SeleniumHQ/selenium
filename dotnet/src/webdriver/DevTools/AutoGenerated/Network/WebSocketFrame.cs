namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// WebSocket message data. This represents an entire WebSocket message, not just a fragmented frame as the name suggests.
    /// </summary>
    public sealed class WebSocketFrame
    {
        /// <summary>
        /// WebSocket message opcode.
        ///</summary>
        [JsonProperty("opcode")]
        public double Opcode
        {
            get;
            set;
        }
        /// <summary>
        /// WebSocket message mask.
        ///</summary>
        [JsonProperty("mask")]
        public bool Mask
        {
            get;
            set;
        }
        /// <summary>
        /// WebSocket message payload data.
        /// If the opcode is 1, this is a text message and payloadData is a UTF-8 string.
        /// If the opcode isn't 1, then payloadData is a base64 encoded string representing binary data.
        ///</summary>
        [JsonProperty("payloadData")]
        public string PayloadData
        {
            get;
            set;
        }
    }
}