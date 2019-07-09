namespace OpenQA.Selenium.DevTools.Security
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// A description of mixed content (HTTP resources on HTTPS pages), as defined by
    /// https://www.w3.org/TR/mixed-content/#categories
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum MixedContentType
    {
        [EnumMember(Value = "blockable")]
        Blockable,
        [EnumMember(Value = "optionally-blockable")]
        OptionallyBlockable,
        [EnumMember(Value = "none")]
        None,
    }
}