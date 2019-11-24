namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Information about a signed exchange signature.
    /// https://wicg.github.io/webpackage/draft-yasskin-httpbis-origin-signed-exchanges-impl.html#rfc.section.3.1
    /// </summary>
    public sealed class SignedExchangeSignature
    {
        /// <summary>
        /// Signed exchange signature label.
        ///</summary>
        [JsonProperty("label")]
        public string Label
        {
            get;
            set;
        }
        /// <summary>
        /// The hex string of signed exchange signature.
        ///</summary>
        [JsonProperty("signature")]
        public string Signature
        {
            get;
            set;
        }
        /// <summary>
        /// Signed exchange signature integrity.
        ///</summary>
        [JsonProperty("integrity")]
        public string Integrity
        {
            get;
            set;
        }
        /// <summary>
        /// Signed exchange signature cert Url.
        ///</summary>
        [JsonProperty("certUrl", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string CertUrl
        {
            get;
            set;
        }
        /// <summary>
        /// The hex string of signed exchange signature cert sha256.
        ///</summary>
        [JsonProperty("certSha256", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string CertSha256
        {
            get;
            set;
        }
        /// <summary>
        /// Signed exchange signature validity Url.
        ///</summary>
        [JsonProperty("validityUrl")]
        public string ValidityUrl
        {
            get;
            set;
        }
        /// <summary>
        /// Signed exchange signature date.
        ///</summary>
        [JsonProperty("date")]
        public long Date
        {
            get;
            set;
        }
        /// <summary>
        /// Signed exchange signature expires.
        ///</summary>
        [JsonProperty("expires")]
        public long Expires
        {
            get;
            set;
        }
        /// <summary>
        /// The encoded certificates.
        ///</summary>
        [JsonProperty("certificates", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string[] Certificates
        {
            get;
            set;
        }
    }
}