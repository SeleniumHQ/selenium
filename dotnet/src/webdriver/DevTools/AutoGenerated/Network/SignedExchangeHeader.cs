namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Information about a signed exchange header.
    /// https://wicg.github.io/webpackage/draft-yasskin-httpbis-origin-signed-exchanges-impl.html#cbor-representation
    /// </summary>
    public sealed class SignedExchangeHeader
    {
        /// <summary>
        /// Signed exchange request URL.
        ///</summary>
        [JsonProperty("requestUrl")]
        public string RequestUrl
        {
            get;
            set;
        }
        /// <summary>
        /// Signed exchange response code.
        ///</summary>
        [JsonProperty("responseCode")]
        public long ResponseCode
        {
            get;
            set;
        }
        /// <summary>
        /// Signed exchange response headers.
        ///</summary>
        [JsonProperty("responseHeaders")]
        public Headers ResponseHeaders
        {
            get;
            set;
        }
        /// <summary>
        /// Signed exchange response signature.
        ///</summary>
        [JsonProperty("signatures")]
        public SignedExchangeSignature[] Signatures
        {
            get;
            set;
        }
    }
}