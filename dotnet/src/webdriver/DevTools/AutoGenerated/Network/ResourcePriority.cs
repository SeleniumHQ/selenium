namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// Loading priority of a resource request.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum ResourcePriority
    {
        [EnumMember(Value = "VeryLow")]
        VeryLow,
        [EnumMember(Value = "Low")]
        Low,
        [EnumMember(Value = "Medium")]
        Medium,
        [EnumMember(Value = "High")]
        High,
        [EnumMember(Value = "VeryHigh")]
        VeryHigh,
    }
}