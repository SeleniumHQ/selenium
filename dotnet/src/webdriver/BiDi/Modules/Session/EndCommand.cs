using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.Session;

internal class EndCommand() : Command<CommandParameters>(CommandParameters.Empty);

public record EndOptions : CommandOptions;
