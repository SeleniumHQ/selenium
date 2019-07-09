namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// ClientNavigationReason
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum ClientNavigationReason
    {
        [EnumMember(Value = "formSubmissionGet")]
        FormSubmissionGet,
        [EnumMember(Value = "formSubmissionPost")]
        FormSubmissionPost,
        [EnumMember(Value = "httpHeaderRefresh")]
        HttpHeaderRefresh,
        [EnumMember(Value = "scriptInitiated")]
        ScriptInitiated,
        [EnumMember(Value = "metaTagRefresh")]
        MetaTagRefresh,
        [EnumMember(Value = "pageBlockInterstitial")]
        PageBlockInterstitial,
        [EnumMember(Value = "reload")]
        Reload,
    }
}