using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OpenQA.Selenium.BiDi.Communication;
using OpenQA.Selenium.BiDi.Communication.Transport;

namespace OpenQA.Selenium.BiDi;

public class BiDi : IAsyncDisposable
{
    private readonly ITransport _transport;
    private readonly Broker _broker;

    private readonly Lazy<Modules.Session.SessionModule> _sessionModule;
    private readonly Lazy<Modules.BrowsingContext.BrowsingContextModule> _browsingContextModule;
    private readonly Lazy<Modules.Browser.BrowserModule> _browserModule;
    private readonly Lazy<Modules.Network.NetworkModule> _networkModule;
    private readonly Lazy<Modules.Input.InputModule> _inputModule;
    private readonly Lazy<Modules.Script.ScriptModule> _scriptModule;
    private readonly Lazy<Modules.Log.LogModule> _logModule;
    private readonly Lazy<Modules.Storage.StorageModule> _storageModule;

    internal BiDi(string url)
    {
        var uri = new Uri(url);

        _transport = new WebSocketTransport(new Uri(url));
        _broker = new Broker(this, _transport);

        _sessionModule = new Lazy<Modules.Session.SessionModule>(() => new Modules.Session.SessionModule(_broker));
        _browsingContextModule = new Lazy<Modules.BrowsingContext.BrowsingContextModule>(() => new Modules.BrowsingContext.BrowsingContextModule(_broker));
        _browserModule = new Lazy<Modules.Browser.BrowserModule>(() => new Modules.Browser.BrowserModule(_broker));
        _networkModule = new Lazy<Modules.Network.NetworkModule>(() => new Modules.Network.NetworkModule(_broker));
        _inputModule = new Lazy<Modules.Input.InputModule>(() => new Modules.Input.InputModule(_broker));
        _scriptModule = new Lazy<Modules.Script.ScriptModule>(() => new Modules.Script.ScriptModule(_broker));
        _logModule = new Lazy<Modules.Log.LogModule>(() => new Modules.Log.LogModule(_broker));
        _storageModule = new Lazy<Modules.Storage.StorageModule>(() => new Modules.Storage.StorageModule(_broker));
    }

    internal Modules.Session.SessionModule SessionModule => _sessionModule.Value;
    internal Modules.BrowsingContext.BrowsingContextModule BrowsingContextModule => _browsingContextModule.Value;
    public Modules.Browser.BrowserModule Browser => _browserModule.Value;
    public Modules.Network.NetworkModule Network => _networkModule.Value;
    internal Modules.Input.InputModule InputModule => _inputModule.Value;
    internal Modules.Script.ScriptModule ScriptModule => _scriptModule.Value;
    public Modules.Log.LogModule Log => _logModule.Value;
    public Modules.Storage.StorageModule Storage => _storageModule.Value;

    public Task<Modules.Session.StatusResult> StatusAsync()
    {
        return SessionModule.StatusAsync();
    }

    public static async Task<BiDi> ConnectAsync(string url)
    {
        var bidi = new BiDi(url);

        await bidi._broker.ConnectAsync(default).ConfigureAwait(false);

        return bidi;
    }

    public Task<Modules.BrowsingContext.BrowsingContext> CreateContextAsync(Modules.BrowsingContext.ContextType type, Modules.BrowsingContext.CreateOptions? options = null)
    {
        return BrowsingContextModule.CreateAsync(type, options);
    }

    public Task<IReadOnlyList<Modules.BrowsingContext.BrowsingContextInfo>> GetTreeAsync(Modules.BrowsingContext.GetTreeOptions? options = null)
    {
        return BrowsingContextModule.GetTreeAsync(options);
    }

    public Task EndAsync(Modules.Session.EndOptions? options = null)
    {
        return SessionModule.EndAsync(options);
    }

    public async ValueTask DisposeAsync()
    {
        await _broker.DisposeAsync().ConfigureAwait(false);

        _transport?.Dispose();
    }

    public Task<Subscription> OnContextCreatedAsync(Func<Modules.BrowsingContext.BrowsingContextInfo, Task> handler, BrowsingContextsSubscriptionOptions? options = null)
    {
        return BrowsingContextModule.OnContextCreatedAsync(handler, options);
    }

    public Task<Subscription> OnContextCreatedAsync(Action<Modules.BrowsingContext.BrowsingContextInfo> handler, BrowsingContextsSubscriptionOptions? options = null)
    {
        return BrowsingContextModule.OnContextCreatedAsync(handler, options);
    }

    public Task<Subscription> OnContextDestroyedAsync(Func<Modules.BrowsingContext.BrowsingContextInfo, Task> handler, BrowsingContextsSubscriptionOptions? options = null)
    {
        return BrowsingContextModule.OnContextDestroyedAsync(handler, options);
    }

    public Task<Subscription> OnContextDestroyedAsync(Action<Modules.BrowsingContext.BrowsingContextInfo> handler, BrowsingContextsSubscriptionOptions? options = null)
    {
        return BrowsingContextModule.OnContextDestroyedAsync(handler, options);
    }

    public Task<Subscription> OnUserPromptOpenedAsync(Func<Modules.BrowsingContext.UserPromptOpenedEventArgs, Task> handler, BrowsingContextsSubscriptionOptions? options = null)
    {
        return BrowsingContextModule.OnUserPromptOpenedAsync(handler, options);
    }

    public Task<Subscription> OnUserPromptOpenedAsync(Action<Modules.BrowsingContext.UserPromptOpenedEventArgs> handler, BrowsingContextsSubscriptionOptions? options = null)
    {
        return BrowsingContextModule.OnUserPromptOpenedAsync(handler, options);
    }

    public Task<Subscription> OnUserPromptClosedAsync(Func<Modules.BrowsingContext.UserPromptClosedEventArgs, Task> handler, BrowsingContextsSubscriptionOptions? options = null)
    {
        return BrowsingContextModule.OnUserPromptClosedAsync(handler, options);
    }

    public Task<Subscription> OnUserPromptClosedAsync(Action<Modules.BrowsingContext.UserPromptClosedEventArgs> handler, BrowsingContextsSubscriptionOptions? options = null)
    {
        return BrowsingContextModule.OnUserPromptClosedAsync(handler, options);
    }
}
