using OpenQA.Selenium.BiDi.Communication;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

internal class CloseCommand(CloseCommandParameters @params) : Command<CloseCommandParameters>(@params);

internal record CloseCommandParameters(BrowsingContext Context) : CommandParameters;

public record CloseOptions : CommandOptions;
