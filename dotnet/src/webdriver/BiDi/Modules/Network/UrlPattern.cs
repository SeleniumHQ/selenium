using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Network;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Pattern), "pattern")]
[JsonDerivedType(typeof(String), "string")]
public abstract record UrlPattern
{
    public static implicit operator UrlPattern(string value) => new String(value);

    public record Pattern : UrlPattern
    {
        public string? Protocol { get; set; }

        public string? Hostname { get; set; }

        public string? Port { get; set; }

        public string? Pathname { get; set; }

        public string? Search { get; set; }
    }

    public record String(string Pattern) : UrlPattern
    {
        public new string Pattern { get; } = Pattern;
    }
}
