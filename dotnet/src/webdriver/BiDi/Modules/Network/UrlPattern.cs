using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Network;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(UrlPatternPattern), "pattern")]
[JsonDerivedType(typeof(UrlPatternString), "string")]
public abstract record UrlPattern
{
    public static UrlPatternPattern Patter(string? protocol = null, string? hostname = null, string? port = null, string? pathname = null, string? search = null)
        => new() { Protocol = protocol, Hostname = hostname, Port = port, Pathname = pathname, Search = search };

    public static UrlPatternString String(string pattern) => new UrlPatternString(pattern);

    public static implicit operator UrlPattern(string value) => new UrlPatternString(value);
}

public record UrlPatternPattern : UrlPattern
{
    public string? Protocol { get; set; }

    public string? Hostname { get; set; }

    public string? Port { get; set; }

    public string? Pathname { get; set; }

    public string? Search { get; set; }
}

public record UrlPatternString(string Pattern) : UrlPattern;
