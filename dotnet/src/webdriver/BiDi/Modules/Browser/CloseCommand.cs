using OpenQA.Selenium.BiDi.Communication;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Browser;

internal class CloseCommand() : Command<CommandParameters>(CommandParameters.Empty);

public record CloseOptions : CommandOptions;
