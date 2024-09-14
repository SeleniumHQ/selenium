using System;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Network;

public record Cookie(string Name, BytesValue Value, string Domain, string Path, long Size, bool HttpOnly, bool Secure, SameSite SameSite)
{
    [JsonInclude]
    public DateTimeOffset? Expiry { get; internal set; }
}

public enum SameSite
{
    Strict,
    Lax,
    None
}
