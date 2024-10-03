using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Modules.Browser;

public class UserContext : IAsyncDisposable
{
    private readonly BiDi _bidi;

    internal UserContext(BiDi bidi, string id)
    {
        _bidi = bidi;
        Id = id;
    }

    public string Id { get; }

    public Task RemoveAsync()
    {
        return _bidi.Browser.RemoveUserContextAsync(this);
    }

    public async ValueTask DisposeAsync()
    {
        await RemoveAsync().ConfigureAwait(false);
    }
}
