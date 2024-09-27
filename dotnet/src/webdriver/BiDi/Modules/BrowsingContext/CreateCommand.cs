using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

internal class CreateCommand(CreateCommandParameters @params) : Command<CreateCommandParameters>(@params);

internal record CreateCommandParameters(ContextType Type) : CommandParameters
{
    public BrowsingContext? ReferenceContext { get; set; }

    public bool? Background { get; set; }

    public Browser.UserContext? UserContext { get; set; }
}

public record CreateOptions : CommandOptions
{
    public BrowsingContext? ReferenceContext { get; set; }

    public bool? Background { get; set; }

    public Browser.UserContext? UserContext { get; set; }
}

public enum ContextType
{
    Tab,
    Window
}

public record CreateResult(BrowsingContext Context);
