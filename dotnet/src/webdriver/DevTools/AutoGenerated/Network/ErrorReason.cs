namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// Network level fetch failure reason.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum ErrorReason
    {
        [EnumMember(Value = "Failed")]
        Failed,
        [EnumMember(Value = "Aborted")]
        Aborted,
        [EnumMember(Value = "TimedOut")]
        TimedOut,
        [EnumMember(Value = "AccessDenied")]
        AccessDenied,
        [EnumMember(Value = "ConnectionClosed")]
        ConnectionClosed,
        [EnumMember(Value = "ConnectionReset")]
        ConnectionReset,
        [EnumMember(Value = "ConnectionRefused")]
        ConnectionRefused,
        [EnumMember(Value = "ConnectionAborted")]
        ConnectionAborted,
        [EnumMember(Value = "ConnectionFailed")]
        ConnectionFailed,
        [EnumMember(Value = "NameNotResolved")]
        NameNotResolved,
        [EnumMember(Value = "InternetDisconnected")]
        InternetDisconnected,
        [EnumMember(Value = "AddressUnreachable")]
        AddressUnreachable,
        [EnumMember(Value = "BlockedByClient")]
        BlockedByClient,
        [EnumMember(Value = "BlockedByResponse")]
        BlockedByResponse,
    }
}