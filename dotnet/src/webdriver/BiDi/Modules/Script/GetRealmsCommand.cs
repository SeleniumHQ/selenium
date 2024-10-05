using OpenQA.Selenium.BiDi.Communication;
using System.Collections;
using System.Collections.Generic;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Script;

internal class GetRealmsCommand(GetRealmsCommandParameters @params) : Command<GetRealmsCommandParameters>(@params);

internal record GetRealmsCommandParameters : CommandParameters
{
    public BrowsingContext.BrowsingContext? Context { get; set; }

    public RealmType? Type { get; set; }
}

public record GetRealmsOptions : CommandOptions
{
    public BrowsingContext.BrowsingContext? Context { get; set; }

    public RealmType? Type { get; set; }
}

public record GetRealmsResult : IReadOnlyList<RealmInfo>
{
    private readonly IReadOnlyList<RealmInfo> _realms;

    internal GetRealmsResult(IReadOnlyList<RealmInfo> realms)
    {
        _realms = realms;
    }

    public RealmInfo this[int index] => _realms[index];

    public int Count => _realms.Count;

    public IEnumerator<RealmInfo> GetEnumerator() => _realms.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => (_realms as IEnumerable).GetEnumerator();
}
