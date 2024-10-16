using OpenQA.Selenium.BiDi.Communication;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Script;

internal class RemovePreloadScriptCommand(RemovePreloadScriptCommandParameters @params) : Command<RemovePreloadScriptCommandParameters>(@params);

internal record RemovePreloadScriptCommandParameters(PreloadScript Script) : CommandParameters;

public record RemovePreloadScriptOptions : CommandOptions;
