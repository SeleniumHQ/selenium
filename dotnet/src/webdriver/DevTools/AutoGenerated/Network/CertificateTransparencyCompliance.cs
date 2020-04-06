namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// Whether the request complied with Certificate Transparency policy.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum CertificateTransparencyCompliance
    {
        [EnumMember(Value = "unknown")]
        Unknown,
        [EnumMember(Value = "not-compliant")]
        NotCompliant,
        [EnumMember(Value = "compliant")]
        Compliant,
    }
}