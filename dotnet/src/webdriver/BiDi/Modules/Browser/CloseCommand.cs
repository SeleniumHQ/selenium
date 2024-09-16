using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.Browser;

internal class CloseCommand() : Command<CommandParameters>(CommandParameters.Empty);

public record CloseOptions : CommandOptions;
