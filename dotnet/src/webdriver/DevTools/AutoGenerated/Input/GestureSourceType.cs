namespace OpenQA.Selenium.DevTools.Input
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// GestureSourceType
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum GestureSourceType
    {
        [EnumMember(Value = "default")]
        Default,
        [EnumMember(Value = "touch")]
        Touch,
        [EnumMember(Value = "mouse")]
        Mouse,
    }
}