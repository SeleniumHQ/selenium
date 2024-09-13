using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Modules.Network;

public class Request
{
    private readonly BiDi _bidi;

    internal Request(BiDi bidi, string id)
    {
        _bidi = bidi;
        Id = id;
    }

    public string Id { get; private set; }

    public Task ContinueAsync(ContinueRequestOptions? options = null)
    {
        return _bidi.Network.ContinueRequestAsync(this, options);
    }

    public Task FailAsync()
    {
        return _bidi.Network.FailRequestAsync(this);
    }

    public Task ProvideResponseAsync(ProvideResponseOptions? options = null)
    {
        return _bidi.Network.ProvideResponseAsync(this, options);
    }

    public Task ContinueResponseAsync(ContinueResponseOptions? options = null)
    {
        return _bidi.Network.ContinueResponseAsync(this, options);
    }

    public Task ContinueWithAuthAsync(AuthCredentials credentials, ContinueWithAuthOptions? options = null)
    {
        return _bidi.Network.ContinueWithAuthAsync(this, credentials, options);
    }

    public Task ContinueWithAuthAsync(ContinueWithDefaultAuthOptions? options = null)
    {
        return _bidi.Network.ContinueWithAuthAsync(this, options);
    }

    public Task ContinueWithAuthAsync(ContinueWithCancelledAuthOptions? options = null)
    {
        return _bidi.Network.ContinueWithAuthAsync(this, options);
    }
}
