namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// Javascript dialog type.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum DialogType
    {
        [EnumMember(Value = "alert")]
        Alert,
        [EnumMember(Value = "confirm")]
        Confirm,
        [EnumMember(Value = "prompt")]
        Prompt,
        [EnumMember(Value = "beforeunload")]
        Beforeunload,
    }
}