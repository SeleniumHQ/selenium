using System.Collections.Generic;
using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.Network;

internal class AddInterceptCommand(AddInterceptCommandParameters @params) : Command<AddInterceptCommandParameters>(@params);

internal record AddInterceptCommandParameters(IEnumerable<InterceptPhase> Phases) : CommandParameters
{
    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; set; }

    public IEnumerable<UrlPattern>? UrlPatterns { get; set; }
}

public record AddInterceptOptions : CommandOptions
{
    public AddInterceptOptions() { }

    internal AddInterceptOptions(BrowsingContextAddInterceptOptions? options)
    {
        UrlPatterns = options?.UrlPatterns;
    }

    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; set; }

    public IEnumerable<UrlPattern>? UrlPatterns { get; set; }
}

public record BrowsingContextAddInterceptOptions
{
    public IEnumerable<UrlPattern>? UrlPatterns { get; set; }
}

public record AddInterceptResult(Intercept Intercept);

public enum InterceptPhase
{
    BeforeRequestSent,
    ResponseStarted,
    AuthRequired
}
