// <copyright file="BrowsingContext.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public sealed record BrowsingContext
{
    public BrowsingContext(BiDi bidi, string id)
        : this(id)
    {
        BiDi = bidi ?? throw new ArgumentNullException(nameof(bidi));
    }

    [JsonConstructor]
    internal BrowsingContext(string id)
    {
        Id = id;
    }

    private BrowsingContextLogModule? _logModule;
    private BrowsingContextNetworkModule? _networkModule;
    private BrowsingContextScriptModule? _scriptModule;
    private BrowsingContextStorageModule? _storageModule;
    private BrowsingContextInputModule? _inputModule;

    internal string Id { get; }

    private BiDi? _bidi;

    [JsonIgnore]
    public BiDi BiDi
    {
        get => _bidi ?? throw new InvalidOperationException($"{nameof(BiDi)} instance has not been hydrated.");
        internal set => _bidi = value;
    }

    [JsonIgnore]
    public BrowsingContextLogModule Log => _logModule ?? Interlocked.CompareExchange(ref _logModule, new BrowsingContextLogModule(this, BiDi.Log), null) ?? _logModule;

    [JsonIgnore]
    public BrowsingContextNetworkModule Network => _networkModule ?? Interlocked.CompareExchange(ref _networkModule, new BrowsingContextNetworkModule(this, BiDi.Network), null) ?? _networkModule;

    [JsonIgnore]
    public BrowsingContextScriptModule Script => _scriptModule ?? Interlocked.CompareExchange(ref _scriptModule, new BrowsingContextScriptModule(this, BiDi.Script), null) ?? _scriptModule;

    [JsonIgnore]
    public BrowsingContextStorageModule Storage => _storageModule ?? Interlocked.CompareExchange(ref _storageModule, new BrowsingContextStorageModule(this, BiDi.Storage), null) ?? _storageModule;

    [JsonIgnore]
    public BrowsingContextInputModule Input => _inputModule ?? Interlocked.CompareExchange(ref _inputModule, new BrowsingContextInputModule(this, BiDi.Input), null) ?? _inputModule;

    public Task<NavigateResult> NavigateAsync(string url, NavigateOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.BrowsingContext.NavigateAsync(this, url, options, cancellationToken);
    }

    public Task<ReloadResult> ReloadAsync(ReloadOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.BrowsingContext.ReloadAsync(this, options, cancellationToken);
    }

    public Task<ActivateResult> ActivateAsync(ActivateOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.BrowsingContext.ActivateAsync(this, options, cancellationToken);
    }

    public Task<LocateNodesResult> LocateNodesAsync(Locator locator, LocateNodesOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.BrowsingContext.LocateNodesAsync(this, locator, options, cancellationToken);
    }

    public Task<CaptureScreenshotResult> CaptureScreenshotAsync(CaptureScreenshotOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.BrowsingContext.CaptureScreenshotAsync(this, options, cancellationToken);
    }

    public Task<CloseResult> CloseAsync(CloseOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.BrowsingContext.CloseAsync(this, options, cancellationToken);
    }

    public Task<TraverseHistoryResult> TraverseHistoryAsync(int delta, TraverseHistoryOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.BrowsingContext.TraverseHistoryAsync(this, delta, options, cancellationToken);
    }

    public Task<SetViewportResult> SetViewportAsync(ContextSetViewportOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.BrowsingContext.SetViewportAsync(ContextSetViewportOptions.WithContext(options, this), cancellationToken);
    }

    public Task<PrintResult> PrintAsync(PrintOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.BrowsingContext.PrintAsync(this, options, cancellationToken);
    }

    public Task<HandleUserPromptResult> HandleUserPromptAsync(HandleUserPromptOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.BrowsingContext.HandleUserPromptAsync(this, options, cancellationToken);
    }

    public Task<GetTreeResult> GetTreeAsync(ContextGetTreeOptions? options = null, CancellationToken cancellationToken = default)
    {
        return BiDi.BrowsingContext.GetTreeAsync(ContextGetTreeOptions.WithContext(options, this), cancellationToken);
    }

    public Task<Subscription> OnNavigationStartedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnNavigationStartedAsync(
            e => HandleNavigationStartedAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnNavigationStartedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnNavigationStartedAsync(
            e => HandleNavigationStarted(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnFragmentNavigatedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnFragmentNavigatedAsync(
            e => HandleFragmentNavigatedAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnFragmentNavigatedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnFragmentNavigatedAsync(
            e => HandleFragmentNavigated(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnHistoryUpdatedAsync(Func<HistoryUpdatedEventArgs, Task> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnHistoryUpdatedAsync(
            e => HandleHistoryUpdatedAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnHistoryUpdatedAsync(Action<HistoryUpdatedEventArgs> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnHistoryUpdatedAsync(
            e => HandleHistoryUpdated(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnDomContentLoadedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnDomContentLoadedAsync(
            e => HandleDomContentLoadedAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnDomContentLoadedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnDomContentLoadedAsync(
            e => HandleDomContentLoaded(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnLoadAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnLoadAsync(
            e => HandleLoad(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnLoadAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnLoadAsync(
            e => HandleLoadAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnDownloadWillBeginAsync(Action<DownloadWillBeginEventArgs> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnDownloadWillBeginAsync(
            e => HandleDownloadWillBegin(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnDownloadWillBeginAsync(Func<DownloadWillBeginEventArgs, Task> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnDownloadWillBeginAsync(
            e => HandleDownloadWillBeginAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnDownloadEndAsync(Action<DownloadEndEventArgs> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnDownloadEndAsync(
            e => HandleDownloadEnd(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnDownloadEndAsync(Func<DownloadEndEventArgs, Task> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnDownloadEndAsync(
            e => HandleDownloadEndAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnNavigationAbortedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnNavigationAbortedAsync(
            e => HandleNavigationAborted(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnNavigationAbortedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnNavigationAbortedAsync(
            e => HandleNavigationAbortedAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnNavigationFailedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnNavigationFailedAsync(
            e => HandleNavigationFailed(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnNavigationFailedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnNavigationFailedAsync(
            e => HandleNavigationFailedAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnNavigationCommittedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnNavigationCommittedAsync(
            e => HandleNavigationCommitted(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    public Task<Subscription> OnNavigationCommittedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        if (handler is null) throw new ArgumentNullException(nameof(handler));

        return BiDi.BrowsingContext.OnNavigationCommittedAsync(
            e => HandleNavigationCommittedAsync(e, handler),
            ContextSubscriptionOptions.WithContext(options, this));
    }

    private async Task HandleNavigationStartedAsync(NavigationInfo e, Func<NavigationInfo, Task> handler)
    {
        if (Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleNavigationStarted(NavigationInfo e, Action<NavigationInfo> handler)
    {
        if (Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleFragmentNavigatedAsync(NavigationInfo e, Func<NavigationInfo, Task> handler)
    {
        if (Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleFragmentNavigated(NavigationInfo e, Action<NavigationInfo> handler)
    {
        if (Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleHistoryUpdatedAsync(HistoryUpdatedEventArgs e, Func<HistoryUpdatedEventArgs, Task> handler)
    {
        if (Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleHistoryUpdated(HistoryUpdatedEventArgs e, Action<HistoryUpdatedEventArgs> handler)
    {
        if (Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleDomContentLoadedAsync(NavigationInfo e, Func<NavigationInfo, Task> handler)
    {
        if (Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleDomContentLoaded(NavigationInfo e, Action<NavigationInfo> handler)
    {
        if (Equals(e.Context))
        {
            handler(e);
        }
    }

    private void HandleLoad(NavigationInfo e, Action<NavigationInfo> handler)
    {
        if (Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleLoadAsync(NavigationInfo e, Func<NavigationInfo, Task> handler)
    {
        if (Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleDownloadWillBegin(DownloadWillBeginEventArgs e, Action<DownloadWillBeginEventArgs> handler)
    {
        if (Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleDownloadWillBeginAsync(DownloadWillBeginEventArgs e, Func<DownloadWillBeginEventArgs, Task> handler)
    {
        if (Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleDownloadEnd(DownloadEndEventArgs e, Action<DownloadEndEventArgs> handler)
    {
        if (Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleDownloadEndAsync(DownloadEndEventArgs e, Func<DownloadEndEventArgs, Task> handler)
    {
        if (Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleNavigationAborted(NavigationInfo e, Action<NavigationInfo> handler)
    {
        if (Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleNavigationAbortedAsync(NavigationInfo e, Func<NavigationInfo, Task> handler)
    {
        if (Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleNavigationFailed(NavigationInfo e, Action<NavigationInfo> handler)
    {
        if (Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleNavigationFailedAsync(NavigationInfo e, Func<NavigationInfo, Task> handler)
    {
        if (Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    private void HandleNavigationCommitted(NavigationInfo e, Action<NavigationInfo> handler)
    {
        if (Equals(e.Context))
        {
            handler(e);
        }
    }

    private async Task HandleNavigationCommittedAsync(NavigationInfo e, Func<NavigationInfo, Task> handler)
    {
        if (Equals(e.Context))
        {
            await handler(e).ConfigureAwait(false);
        }
    }

    public bool Equals(BrowsingContext? other)
    {
        return other is not null && string.Equals(Id, other.Id, StringComparison.Ordinal);
    }

    public override int GetHashCode()
    {
        return Id is not null ? StringComparer.Ordinal.GetHashCode(Id) : 0;
    }

    private bool PrintMembers(StringBuilder builder)
    {
        builder.Append($"Id = {Id}");
        return true;
    }
}
