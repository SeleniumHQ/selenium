using OpenQA.Selenium.BiDi.Communication;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Browser;

internal class CreateUserContextCommand() : Command<CommandParameters>(CommandParameters.Empty);

public record CreateUserContextOptions : CommandOptions;
