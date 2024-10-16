using OpenQA.Selenium.BiDi.Communication;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Session;

internal class StatusCommand() : Command<CommandParameters>(CommandParameters.Empty);

public record StatusResult(bool Ready, string Message);

public record StatusOptions : CommandOptions;
