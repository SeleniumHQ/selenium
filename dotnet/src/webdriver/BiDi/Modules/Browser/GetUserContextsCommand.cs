using OpenQA.Selenium.BiDi.Communication;
using System.Collections;
using System.Collections.Generic;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Browser;

internal class GetUserContextsCommand() : Command<CommandParameters>(CommandParameters.Empty);

public record GetUserContextsOptions : CommandOptions;

public record GetUserContextsResult : IReadOnlyList<UserContextInfo>
{
    private readonly IReadOnlyList<UserContextInfo> _userContexts;

    internal GetUserContextsResult(IReadOnlyList<UserContextInfo> userContexts)
    {
        _userContexts = userContexts;
    }

    public UserContextInfo this[int index] => _userContexts[index];

    public int Count => _userContexts.Count;

    public IEnumerator<UserContextInfo> GetEnumerator() => _userContexts.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => (_userContexts as IEnumerable).GetEnumerator();
}
