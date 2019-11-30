namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// Transition type.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum TransitionType
    {
        [EnumMember(Value = "link")]
        Link,
        [EnumMember(Value = "typed")]
        Typed,
        [EnumMember(Value = "address_bar")]
        AddressBar,
        [EnumMember(Value = "auto_bookmark")]
        AutoBookmark,
        [EnumMember(Value = "auto_subframe")]
        AutoSubframe,
        [EnumMember(Value = "manual_subframe")]
        ManualSubframe,
        [EnumMember(Value = "generated")]
        Generated,
        [EnumMember(Value = "auto_toplevel")]
        AutoToplevel,
        [EnumMember(Value = "form_submit")]
        FormSubmit,
        [EnumMember(Value = "reload")]
        Reload,
        [EnumMember(Value = "keyword")]
        Keyword,
        [EnumMember(Value = "keyword_generated")]
        KeywordGenerated,
        [EnumMember(Value = "other")]
        Other,
    }
}