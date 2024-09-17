namespace OpenQA.Selenium.BiDi.Modules.Session;

public class CapabilityRequest
{
    public bool? AcceptInsecureCerts { get; set; }

    public string? BrowserName { get; set; }

    public string? BrowserVersion { get; set; }

    public string? PlatformName { get; set; }

    public ProxyConfiguration? ProxyConfiguration { get; set; }

    public bool? WebSocketUrl { get; set; }
}
