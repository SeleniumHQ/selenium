namespace OpenQA.Selenium.BiDi.Modules.Network;

public record SetCookieHeader(string Name, BytesValue Value)
{
    public string? Domain { get; set; }

    public bool? HttpOnly { get; set; }

    public string? Expiry { get; set; }

    public long? MaxAge { get; set; }

    public string? Path { get; set; }

    public SameSite? SameSite { get; set; }

    public bool? Secure { get; set; }
}
