using OpenQA.Selenium.BiDi.Communication;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Session;

internal class EndCommand() : Command<CommandParameters>(CommandParameters.Empty);

public record EndOptions : CommandOptions;
