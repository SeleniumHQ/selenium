namespace OpenQA.Selenium.DevTools.Security
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// The security level of a page or resource.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum SecurityState
    {
        [EnumMember(Value = "unknown")]
        Unknown,
        [EnumMember(Value = "neutral")]
        Neutral,
        [EnumMember(Value = "insecure")]
        Insecure,
        [EnumMember(Value = "secure")]
        Secure,
        [EnumMember(Value = "info")]
        Info,
    }
}