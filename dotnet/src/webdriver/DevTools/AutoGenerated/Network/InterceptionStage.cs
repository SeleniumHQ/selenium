namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// Stages of the interception to begin intercepting. Request will intercept before the request is
    /// sent. Response will intercept after the response is received.
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum InterceptionStage
    {
        [EnumMember(Value = "Request")]
        Request,
        [EnumMember(Value = "HeadersReceived")]
        HeadersReceived,
    }
}