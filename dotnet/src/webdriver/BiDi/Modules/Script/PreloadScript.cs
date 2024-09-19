using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Modules.Script;

public class PreloadScript : IAsyncDisposable
{
    private readonly BiDi _bidi;

    public PreloadScript(BiDi bidi, string id)
    {
        _bidi = bidi;
        Id = id;
    }

    public string Id { get; }

    public Task RemoveAsync()
    {
        return _bidi.ScriptModule.RemovePreloadScriptAsync(this);
    }

    public async ValueTask DisposeAsync()
    {
        await RemoveAsync().ConfigureAwait(false);
    }
}
