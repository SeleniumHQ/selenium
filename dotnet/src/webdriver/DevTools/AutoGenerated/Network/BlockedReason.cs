namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// The reason why request was blocked.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum BlockedReason
    {
        [EnumMember(Value = "other")]
        Other,
        [EnumMember(Value = "csp")]
        Csp,
        [EnumMember(Value = "mixed-content")]
        MixedContent,
        [EnumMember(Value = "origin")]
        Origin,
        [EnumMember(Value = "inspector")]
        Inspector,
        [EnumMember(Value = "subresource-filter")]
        SubresourceFilter,
        [EnumMember(Value = "content-type")]
        ContentType,
        [EnumMember(Value = "collapsed-by-client")]
        CollapsedByClient,
    }
}