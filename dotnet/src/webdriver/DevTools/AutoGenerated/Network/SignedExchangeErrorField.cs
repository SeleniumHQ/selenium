namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// Field type for a signed exchange related error.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum SignedExchangeErrorField
    {
        [EnumMember(Value = "signatureSig")]
        SignatureSig,
        [EnumMember(Value = "signatureIntegrity")]
        SignatureIntegrity,
        [EnumMember(Value = "signatureCertUrl")]
        SignatureCertUrl,
        [EnumMember(Value = "signatureCertSha256")]
        SignatureCertSha256,
        [EnumMember(Value = "signatureValidityUrl")]
        SignatureValidityUrl,
        [EnumMember(Value = "signatureTimestamps")]
        SignatureTimestamps,
    }
}