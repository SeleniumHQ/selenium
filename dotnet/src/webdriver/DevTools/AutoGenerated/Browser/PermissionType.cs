namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// PermissionType
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum PermissionType
    {
        [EnumMember(Value = "accessibilityEvents")]
        AccessibilityEvents,
        [EnumMember(Value = "audioCapture")]
        AudioCapture,
        [EnumMember(Value = "backgroundSync")]
        BackgroundSync,
        [EnumMember(Value = "backgroundFetch")]
        BackgroundFetch,
        [EnumMember(Value = "clipboardRead")]
        ClipboardRead,
        [EnumMember(Value = "clipboardWrite")]
        ClipboardWrite,
        [EnumMember(Value = "durableStorage")]
        DurableStorage,
        [EnumMember(Value = "flash")]
        Flash,
        [EnumMember(Value = "geolocation")]
        Geolocation,
        [EnumMember(Value = "midi")]
        Midi,
        [EnumMember(Value = "midiSysex")]
        MidiSysex,
        [EnumMember(Value = "notifications")]
        Notifications,
        [EnumMember(Value = "paymentHandler")]
        PaymentHandler,
        [EnumMember(Value = "protectedMediaIdentifier")]
        ProtectedMediaIdentifier,
        [EnumMember(Value = "sensors")]
        Sensors,
        [EnumMember(Value = "videoCapture")]
        VideoCapture,
        [EnumMember(Value = "idleDetection")]
        IdleDetection,
    }
}