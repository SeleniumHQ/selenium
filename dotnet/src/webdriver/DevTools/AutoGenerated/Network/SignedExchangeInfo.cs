namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Information about a signed exchange response.
    /// </summary>
    public sealed class SignedExchangeInfo
    {
        /// <summary>
        /// The outer response of signed HTTP exchange which was received from network.
        ///</summary>
        [JsonProperty("outerResponse")]
        public Response OuterResponse
        {
            get;
            set;
        }
        /// <summary>
        /// Information about the signed exchange header.
        ///</summary>
        [JsonProperty("header", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public SignedExchangeHeader Header
        {
            get;
            set;
        }
        /// <summary>
        /// Security details for the signed exchange header.
        ///</summary>
        [JsonProperty("securityDetails", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public SecurityDetails SecurityDetails
        {
            get;
            set;
        }
        /// <summary>
        /// Errors occurred while handling the signed exchagne.
        ///</summary>
        [JsonProperty("errors", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public SignedExchangeError[] Errors
        {
            get;
            set;
        }
    }
}