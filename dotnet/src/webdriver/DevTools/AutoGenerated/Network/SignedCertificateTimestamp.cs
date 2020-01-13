namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Details of a signed certificate timestamp (SCT).
    /// </summary>
    public sealed class SignedCertificateTimestamp
    {
        /// <summary>
        /// Validation status.
        ///</summary>
        [JsonProperty("status")]
        public string Status
        {
            get;
            set;
        }
        /// <summary>
        /// Origin.
        ///</summary>
        [JsonProperty("origin")]
        public string Origin
        {
            get;
            set;
        }
        /// <summary>
        /// Log name / description.
        ///</summary>
        [JsonProperty("logDescription")]
        public string LogDescription
        {
            get;
            set;
        }
        /// <summary>
        /// Log ID.
        ///</summary>
        [JsonProperty("logId")]
        public string LogId
        {
            get;
            set;
        }
        /// <summary>
        /// Issuance date.
        ///</summary>
        [JsonProperty("timestamp")]
        public double Timestamp
        {
            get;
            set;
        }
        /// <summary>
        /// Hash algorithm.
        ///</summary>
        [JsonProperty("hashAlgorithm")]
        public string HashAlgorithm
        {
            get;
            set;
        }
        /// <summary>
        /// Signature algorithm.
        ///</summary>
        [JsonProperty("signatureAlgorithm")]
        public string SignatureAlgorithm
        {
            get;
            set;
        }
        /// <summary>
        /// Signature data.
        ///</summary>
        [JsonProperty("signatureData")]
        public string SignatureData
        {
            get;
            set;
        }
    }
}