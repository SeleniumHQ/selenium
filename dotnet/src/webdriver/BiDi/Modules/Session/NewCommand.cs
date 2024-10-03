using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.Session;

internal class NewCommand(NewCommandParameters @params) : Command<NewCommandParameters>(@params);

internal record NewCommandParameters(CapabilitiesRequest Capabilities) : CommandParameters;

public record NewOptions : CommandOptions;

public record NewResult(string SessionId, Capability Capability);

public record Capability(bool AcceptInsecureCerts, string BrowserName, string BrowserVersion, string PlatformName, bool SetWindowRect, string UserAgent)
{
    public ProxyConfiguration? Proxy { get; set; }

    public string? WebSocketUrl { get; set; }
}
