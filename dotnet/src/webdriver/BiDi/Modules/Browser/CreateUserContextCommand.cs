using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.Browser;

internal class CreateUserContextCommand() : Command<CommandParameters>(CommandParameters.Empty);

public record CreateUserContextOptions : CommandOptions;
