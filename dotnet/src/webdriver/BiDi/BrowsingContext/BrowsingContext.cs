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

    public Task<NavigateResult> NavigateAsync(string url, NavigateOptions? options = null)
    {
        return BiDi.BrowsingContext.NavigateAsync(this, url, options);
    }

    public Task<ReloadResult> ReloadAsync(ReloadOptions? options = null)
    {
        return BiDi.BrowsingContext.ReloadAsync(this, options);
    }

    public Task<ActivateResult> ActivateAsync(ActivateOptions? options = null)
    {
        return BiDi.BrowsingContext.ActivateAsync(this, options);
    }

    public Task<LocateNodesResult> LocateNodesAsync(Locator locator, LocateNodesOptions? options = null)
    {
        return BiDi.BrowsingContext.LocateNodesAsync(this, locator, options);
    }

    public Task<CaptureScreenshotResult> CaptureScreenshotAsync(CaptureScreenshotOptions? options = null)
    {
        return BiDi.BrowsingContext.CaptureScreenshotAsync(this, options);
    }

    public Task<CloseResult> CloseAsync(CloseOptions? options = null)
    {
        return BiDi.BrowsingContext.CloseAsync(this, options);
    }

    public Task<TraverseHistoryResult> TraverseHistoryAsync(int delta, TraverseHistoryOptions? options = null)
    {
        return BiDi.BrowsingContext.TraverseHistoryAsync(this, delta, options);
    }

    public Task<SetViewportResult> SetViewportAsync(SetViewportOptions? options = null)
    {
        return BiDi.BrowsingContext.SetViewportAsync(this, options);
    }

    public Task<PrintResult> PrintAsync(PrintOptions? options = null)
    {
        return BiDi.BrowsingContext.PrintAsync(this, options);
    }

    public Task<HandleUserPromptResult> HandleUserPromptAsync(HandleUserPromptOptions? options = null)
    {
        return BiDi.BrowsingContext.HandleUserPromptAsync(this, options);
    }

    public Task<GetTreeResult> GetTreeAsync(BrowsingContextGetTreeOptions? options = null)
    {
        GetTreeOptions getTreeOptions = new(options)
        {
            Root = this
        };

        return BiDi.BrowsingContext.GetTreeAsync(getTreeOptions);
    }

    public Task<Subscription> OnNavigationStartedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnNavigationStartedAsync(async e =>
        {
            if (Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnNavigationStartedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnNavigationStartedAsync(e =>
        {
            if (Equals(e.Context))
            {
                handler(e);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnFragmentNavigatedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnFragmentNavigatedAsync(async e =>
        {
            if (Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnFragmentNavigatedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnFragmentNavigatedAsync(e =>
        {
            if (Equals(e.Context))
            {
                handler(e);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnHistoryUpdatedAsync(Func<HistoryUpdatedEventArgs, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnHistoryUpdatedAsync(async e =>
        {
            if (Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnHistoryUpdatedAsync(Action<HistoryUpdatedEventArgs> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnHistoryUpdatedAsync(e =>
        {
            if (Equals(e.Context))
            {
                handler(e);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnDomContentLoadedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnDomContentLoadedAsync(async e =>
        {
            if (Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnDomContentLoadedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnDomContentLoadedAsync(e =>
        {
            if (Equals(e.Context))
            {
                handler(e);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnLoadAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnLoadAsync(e =>
        {
            if (Equals(e.Context))
            {
                handler(e);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnLoadAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnLoadAsync(async e =>
        {
            if (Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnDownloadWillBeginAsync(Action<DownloadWillBeginEventArgs> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnDownloadWillBeginAsync(e =>
        {
            if (Equals(e.Context))
            {
                handler(e);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnDownloadWillBeginAsync(Func<DownloadWillBeginEventArgs, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnDownloadWillBeginAsync(async e =>
        {
            if (Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnDownloadEndAsync(Action<DownloadEndEventArgs> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnDownloadEndAsync(e =>
        {
            if (Equals(e.Context))
            {
                handler(e);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnDownloadEndAsync(Func<DownloadEndEventArgs, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnDownloadEndAsync(async e =>
        {
            if (Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnNavigationAbortedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnNavigationAbortedAsync(e =>
        {
            if (Equals(e.Context))
            {
                handler(e);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnNavigationAbortedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnNavigationAbortedAsync(async e =>
        {
            if (Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnNavigationFailedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnNavigationFailedAsync(e =>
        {
            if (Equals(e.Context))
            {
                handler(e);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnNavigationFailedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnNavigationFailedAsync(async e =>
        {
            if (Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnNavigationCommittedAsync(Action<NavigationInfo> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnNavigationCommittedAsync(e =>
        {
            if (Equals(e.Context))
            {
                handler(e);
            }
        }, options.WithContext(this));
    }

    public Task<Subscription> OnNavigationCommittedAsync(Func<NavigationInfo, Task> handler, ContextSubscriptionOptions? options = null)
    {
        return BiDi.BrowsingContext.OnNavigationCommittedAsync(async e =>
        {
            if (Equals(e.Context))
            {
                await handler(e).ConfigureAwait(false);
            }
        }, options.WithContext(this));
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
