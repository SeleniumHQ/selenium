namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// WebSocket request data.
    /// </summary>
    public sealed class WebSocketRequest
    {
        /// <summary>
        /// HTTP request headers.
        ///</summary>
        [JsonProperty("headers")]
        public Headers Headers
        {
            get;
            set;
        }
    }
}