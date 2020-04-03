namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Security details about a request.
    /// </summary>
    public sealed class SecurityDetails
    {
        /// <summary>
        /// Protocol name (e.g. "TLS 1.2" or "QUIC").
        ///</summary>
        [JsonProperty("protocol")]
        public string Protocol
        {
            get;
            set;
        }
        /// <summary>
        /// Key Exchange used by the connection, or the empty string if not applicable.
        ///</summary>
        [JsonProperty("keyExchange")]
        public string KeyExchange
        {
            get;
            set;
        }
        /// <summary>
        /// (EC)DH group used by the connection, if applicable.
        ///</summary>
        [JsonProperty("keyExchangeGroup", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string KeyExchangeGroup
        {
            get;
            set;
        }
        /// <summary>
        /// Cipher name.
        ///</summary>
        [JsonProperty("cipher")]
        public string Cipher
        {
            get;
            set;
        }
        /// <summary>
        /// TLS MAC. Note that AEAD ciphers do not have separate MACs.
        ///</summary>
        [JsonProperty("mac", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Mac
        {
            get;
            set;
        }
        /// <summary>
        /// Certificate ID value.
        ///</summary>
        [JsonProperty("certificateId")]
        public long CertificateId
        {
            get;
            set;
        }
        /// <summary>
        /// Certificate subject name.
        ///</summary>
        [JsonProperty("subjectName")]
        public string SubjectName
        {
            get;
            set;
        }
        /// <summary>
        /// Subject Alternative Name (SAN) DNS names and IP addresses.
        ///</summary>
        [JsonProperty("sanList")]
        public string[] SanList
        {
            get;
            set;
        }
        /// <summary>
        /// Name of the issuing CA.
        ///</summary>
        [JsonProperty("issuer")]
        public string Issuer
        {
            get;
            set;
        }
        /// <summary>
        /// Certificate valid from date.
        ///</summary>
        [JsonProperty("validFrom")]
        public double ValidFrom
        {
            get;
            set;
        }
        /// <summary>
        /// Certificate valid to (expiration) date
        ///</summary>
        [JsonProperty("validTo")]
        public double ValidTo
        {
            get;
            set;
        }
        /// <summary>
        /// List of signed certificate timestamps (SCTs).
        ///</summary>
        [JsonProperty("signedCertificateTimestampList")]
        public SignedCertificateTimestamp[] SignedCertificateTimestampList
        {
            get;
            set;
        }
        /// <summary>
        /// Whether the request complied with Certificate Transparency policy
        ///</summary>
        [JsonProperty("certificateTransparencyCompliance")]
        public CertificateTransparencyCompliance CertificateTransparencyCompliance
        {
            get;
            set;
        }
    }
}