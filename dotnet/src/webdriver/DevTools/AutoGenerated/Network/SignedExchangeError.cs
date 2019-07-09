namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Information about a signed exchange response.
    /// </summary>
    public sealed class SignedExchangeError
    {
        /// <summary>
        /// Error message.
        ///</summary>
        [JsonProperty("message")]
        public string Message
        {
            get;
            set;
        }
        /// <summary>
        /// The index of the signature which caused the error.
        ///</summary>
        [JsonProperty("signatureIndex", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? SignatureIndex
        {
            get;
            set;
        }
        /// <summary>
        /// The field which caused the error.
        ///</summary>
        [JsonProperty("errorField", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public SignedExchangeErrorField? ErrorField
        {
            get;
            set;
        }
    }
}