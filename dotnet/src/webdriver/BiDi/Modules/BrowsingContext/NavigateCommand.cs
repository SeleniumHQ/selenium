using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

internal class NavigateCommand(NavigateCommandParameters @params) : Command<NavigateCommandParameters>(@params);

internal record NavigateCommandParameters(BrowsingContext Context, string Url) : CommandParameters
{
    public ReadinessState? Wait { get; set; }
}

public record NavigateOptions : CommandOptions
{
    public ReadinessState? Wait { get; set; }
}

public enum ReadinessState
{
    None,
    Interactive,
    Complete
}

public record NavigateResult(Navigation Navigation, string Url);
