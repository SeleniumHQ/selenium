using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

public class BrowsingContext
{
    internal BrowsingContext(BiDi bidi, string id)
    {
        BiDi = bidi;
        Id = id;

        _logModule = new Lazy<BrowsingContextLogModule>(() => new BrowsingContextLogModule(this, BiDi.Log));
        _networkModule = new Lazy<BrowsingContextNetworkModule>(() => new BrowsingContextNetworkModule(this, BiDi.Network));
        _scriptModule = new Lazy<BrowsingContextScriptModule>(() => new BrowsingContextScriptModule(this, BiDi.ScriptModule));
        _storageModule = new Lazy<BrowsingContextStorageModule>(() => new BrowsingContextStorageModule(this, BiDi.Storage));
        _inputModule = new Lazy<BrowsingContextInputModule>(() => new BrowsingContextInputModule(this, BiDi.InputModule));
    }

    private readonly Lazy<BrowsingContextLogModule> _logModule;
    private readonly Lazy<BrowsingContextNetworkModule> _networkModule;
    private readonly Lazy<BrowsingContextScriptModule> _scriptModule;
    private readonly Lazy<BrowsingContextStorageModule> _storageModule;
    private readonly Lazy<BrowsingContextInputModule> _inputModule;

    internal string Id { get; }

    public BiDi BiDi { get; }

    public BrowsingContextLogModule Log => _logModule.Value;

    public BrowsingContextNetworkModule Network => _networkModule.Value;

    public BrowsingContextScriptModule Script => _scriptModule.Value;

    public BrowsingContextStorageModule Storage => _storageModule.Value;

    public BrowsingContextInputModule Input => _inputModule.Value;

    public Task<NavigateResult> NavigateAsync(string url, NavigateOptions? options = null)
    {
        return BiDi.BrowsingContextModule.NavigateAsync(this, url, options);
    }

    public Task<NavigateResult> ReloadAsync(ReloadOptions? options = null)
    {
        return BiDi.BrowsingContextModule.ReloadAsync(this, options);
    }

    public Task ActivateAsync(ActivateOptions? options = null)
    {
        return BiDi.BrowsingContextModule.ActivateAsync(this, options);
    }

    public Task<IReadOnlyList<Script.NodeRemoteValue>> LocateNodesAsync(Locator locator, LocateNodesOptions? options = null)
    {
        return BiDi.BrowsingContextModule.LocateNodesAsync(this, locator, options);
    }

    public Task<CaptureScreenshotResult> CaptureScreenshotAsync(CaptureScreenshotOptions? options = null)
    {
        return BiDi.BrowsingContextModule.CaptureScreenshotAsync(this, options);
    }

    public Task CloseAsync(CloseOptions? options = null)
    {
        return BiDi.BrowsingContextModule.CloseAsync(this, options);
    }

    public Task TraverseHistoryAsync(int delta, TraverseHistoryOptions? options = null)
    {
        return BiDi.BrowsingContextModule.TraverseHistoryAsync(this, delta, options);
    }

    public Task NavigateBackAsync(TraverseHistoryOptions? options = null)
    {
        return TraverseHistoryAsync(-1, options);
    }

    public Task NavigateForwardAsync(TraverseHistoryOptions? options = null)
    {
        return TraverseHistoryAsync(1, options);
    }

    public Task SetViewportAsync(SetViewportOptions? options = null)
    {
        return BiDi.BrowsingContextModule.SetViewportAsync(this, options);
    }

    public Task<PrintResult> PrintAsync(PrintOptions? options = null)
    {
        return BiDi.BrowsingContextModule.PrintAsync(this, options);
    }

    public Task HandleUserPromptAsync(HandleUserPromptOptions? options = null)
    {
        return BiDi.BrowsingContextModule.HandleUserPromptAsync(this, options);
    }

    public Task<IReadOnlyList<BrowsingContextInfo>> GetTreeAsync(BrowsingContextGetTreeOptions? options = null)
    {
        GetTreeOptions getTreeOptions = new(options)
        {
            Root = this
        };

        return BiDi.BrowsingContextModule.GetTreeAsync(getTreeOptions);
    }

    public Task<Subscription> OnNavigationStartedAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnNavigationStartedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnNavigationStartedAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnNavigationStartedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnFragmentNavigatedAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnFragmentNavigatedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnFragmentNavigatedAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnFragmentNavigatedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnDomContentLoadedAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnDomContentLoadedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnLoadAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnLoadAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnLoadAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnLoadAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnDownloadWillBeginAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnDownloadWillBeginAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnDownloadWillBeginAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnDownloadWillBeginAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnNavigationAbortedAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnNavigationAbortedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnNavigationAbortedAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnNavigationAbortedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnNavigationFailedAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnNavigationFailedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnNavigationFailedAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnNavigationFailedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public Task<Subscription> OnDomContentLoadedAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContextModule.OnDomContentLoadedAsync(handler, new BrowsingContextsSubscriptionOptions(options) { Contexts = [this] });
    }

    public override bool Equals(object? obj)
    {
        if (obj is BrowsingContext browsingContextObj) return browsingContextObj.Id == Id;

        return false;
    }

    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }
}
