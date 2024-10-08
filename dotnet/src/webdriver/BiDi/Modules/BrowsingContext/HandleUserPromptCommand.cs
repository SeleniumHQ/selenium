using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

class HandleUserPromptCommand(HandleUserPromptCommandParameters @params) : Command<HandleUserPromptCommandParameters>(@params);

internal record HandleUserPromptCommandParameters(BrowsingContext Context) : CommandParameters
{
    public bool? Accept { get; set; }

    public string? UserText { get; set; }
}

public record HandleUserPromptOptions : CommandOptions
{
    public bool? Accept { get; set; }

    public string? UserText { get; set; }
}
