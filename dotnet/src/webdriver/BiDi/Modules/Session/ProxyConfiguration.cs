using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Session;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "proxyType")]
[JsonDerivedType(typeof(AutodetectProxyConfiguration), "autodetect")]
[JsonDerivedType(typeof(DirectProxyConfiguration), "direct")]
[JsonDerivedType(typeof(ManualProxyConfiguration), "manual")]
[JsonDerivedType(typeof(PacProxyConfiguration), "pac")]
[JsonDerivedType(typeof(SystemProxyConfiguration), "system")]
public abstract record ProxyConfiguration;

public record AutodetectProxyConfiguration : ProxyConfiguration;

public record DirectProxyConfiguration : ProxyConfiguration;

public record ManualProxyConfiguration : ProxyConfiguration
{
    public string? FtpProxy { get; set; }

    public string? HttpProxy { get; set; }

    public string? SslProxy { get; set; }

    public string? SocksProxy { get; set; }

    public long? SocksVersion { get; set; }
}

public record PacProxyConfiguration(string ProxyAutoconfigUrl) : ProxyConfiguration;

public record SystemProxyConfiguration : ProxyConfiguration;
