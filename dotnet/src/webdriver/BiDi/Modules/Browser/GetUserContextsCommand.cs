using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Browser;

internal class GetUserContextsCommand() : Command<CommandParameters>(CommandParameters.Empty);

public record GetUserContextsOptions : CommandOptions;

public record GetUserContextsResult(IReadOnlyList<UserContextInfo> UserContexts);
