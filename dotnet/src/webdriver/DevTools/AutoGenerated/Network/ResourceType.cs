namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// Resource type as it was perceived by the rendering engine.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum ResourceType
    {
        [EnumMember(Value = "Document")]
        Document,
        [EnumMember(Value = "Stylesheet")]
        Stylesheet,
        [EnumMember(Value = "Image")]
        Image,
        [EnumMember(Value = "Media")]
        Media,
        [EnumMember(Value = "Font")]
        Font,
        [EnumMember(Value = "Script")]
        Script,
        [EnumMember(Value = "TextTrack")]
        TextTrack,
        [EnumMember(Value = "XHR")]
        XHR,
        [EnumMember(Value = "Fetch")]
        Fetch,
        [EnumMember(Value = "EventSource")]
        EventSource,
        [EnumMember(Value = "WebSocket")]
        WebSocket,
        [EnumMember(Value = "Manifest")]
        Manifest,
        [EnumMember(Value = "SignedExchange")]
        SignedExchange,
        [EnumMember(Value = "Ping")]
        Ping,
        [EnumMember(Value = "CSPViolationReport")]
        CSPViolationReport,
        [EnumMember(Value = "Other")]
        Other,
    }
}