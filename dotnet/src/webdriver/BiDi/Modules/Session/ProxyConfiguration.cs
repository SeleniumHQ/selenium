using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Session;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "proxyType")]
[JsonDerivedType(typeof(Autodetect), "autodetect")]
[JsonDerivedType(typeof(Direct), "direct")]
[JsonDerivedType(typeof(Manual), "manual")]
[JsonDerivedType(typeof(Pac), "pac")]
[JsonDerivedType(typeof(System), "system")]
public abstract record ProxyConfiguration
{
    public record Autodetect : ProxyConfiguration;

    public record Direct : ProxyConfiguration;

    public record Manual : ProxyConfiguration
    {
        public string? FtpProxy { get; set; }

        public string? HttpProxy { get; set; }

        public string? SslProxy { get; set; }

        public string? SocksProxy { get; set; }

        public long? SocksVersion { get; set; }
    }

    public record Pac(string ProxyAutoconfigUrl) : ProxyConfiguration;

    public record System : ProxyConfiguration;
}
