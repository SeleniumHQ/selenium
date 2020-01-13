namespace OpenQA.Selenium.DevTools.Security
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// The action to take when a certificate error occurs. continue will continue processing the
    /// request and cancel will cancel the request.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum CertificateErrorAction
    {
        [EnumMember(Value = "continue")]
        Continue,
        [EnumMember(Value = "cancel")]
        Cancel,
    }
}