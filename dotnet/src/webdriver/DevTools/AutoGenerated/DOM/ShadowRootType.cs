namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// Shadow root type.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum ShadowRootType
    {
        [EnumMember(Value = "user-agent")]
        UserAgent,
        [EnumMember(Value = "open")]
        Open,
        [EnumMember(Value = "closed")]
        Closed,
    }
}