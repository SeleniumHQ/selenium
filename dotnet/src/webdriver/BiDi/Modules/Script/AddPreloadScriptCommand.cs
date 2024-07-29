using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Script;

internal class AddPreloadScriptCommand(AddPreloadScriptCommandParameters @params) : Command<AddPreloadScriptCommandParameters>(@params);

internal record AddPreloadScriptCommandParameters(string FunctionDeclaration) : CommandParameters
{
    public IEnumerable<ChannelValue>? Arguments { get; set; }

    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; set; }

    public string? Sandbox { get; set; }
}

public record AddPreloadScriptOptions : CommandOptions
{
    public IEnumerable<ChannelValue>? Arguments { get; set; }

    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; set; }

    public string? Sandbox { get; set; }
}

internal record AddPreloadScriptResult(PreloadScript Script);
