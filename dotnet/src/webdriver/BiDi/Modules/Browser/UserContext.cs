using System;
using System.Threading.Tasks;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Browser;

public class UserContext : IAsyncDisposable
{
    private readonly BiDi _bidi;

    internal UserContext(BiDi bidi, string id)
    {
        _bidi = bidi;
        Id = id;
    }

    internal string Id { get; }

    public Task RemoveAsync()
    {
        return _bidi.Browser.RemoveUserContextAsync(this);
    }

    public async ValueTask DisposeAsync()
    {
        await RemoveAsync().ConfigureAwait(false);
    }

    public override bool Equals(object? obj)
    {
        if (obj is UserContext userContextObj) return userContextObj.Id == Id;

        return false;
    }

    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
}
