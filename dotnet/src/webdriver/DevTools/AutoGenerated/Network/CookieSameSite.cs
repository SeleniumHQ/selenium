namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;
    using Newtonsoft.Json.Converters;
    using System.Runtime.Serialization;

    /// <summary>
    /// Represents the cookie's 'SameSite' status:
    /// https://tools.ietf.org/html/draft-west-first-party-cookies
    /// </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum CookieSameSite
    {
        [EnumMember(Value = "Strict")]
        Strict,
        [EnumMember(Value = "Lax")]
        Lax,
    }
}