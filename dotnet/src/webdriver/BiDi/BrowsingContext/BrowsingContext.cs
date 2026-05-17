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

using System.Diagnostics.CodeAnalysis;
using System.Text;
using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

[JsonConverter(typeof(Converter))]
public sealed record BrowsingContext : IIdentifiable
{
    public BrowsingContext(IBiDi bidi, string id)
    {
        ArgumentNullException.ThrowIfNull(bidi);
        BiDi = bidi;
        Id = id;
    }

    private IBrowsingContextLogModule? _logModule;
    private IBrowsingContextNetworkModule? _networkModule;
    private IBrowsingContextScriptModule? _scriptModule;
    private IBrowsingContextStorageModule? _storageModule;
    private IBrowsingContextInputModule? _inputModule;

    public string Id { get; }

    [JsonIgnore]
    public IBiDi BiDi { get; }

    [JsonIgnore]
    public IBrowsingContextLogModule Log => _logModule ?? Interlocked.CompareExchange(ref _logModule, new BrowsingContextLogModule(this, ((BiDi)BiDi).EventDispatcher), null) ?? _logModule;

    [JsonIgnore]
    public IBrowsingContextNetworkModule Network => _networkModule ?? Interlocked.CompareExchange(ref _networkModule, new BrowsingContextNetworkModule(this, BiDi.Network, ((BiDi)BiDi).EventDispatcher), null) ?? _networkModule;

    [JsonIgnore]
    public IBrowsingContextScriptModule Script => _scriptModule ?? Interlocked.CompareExchange(ref _scriptModule, new BrowsingContextScriptModule(this, BiDi.Script), null) ?? _scriptModule;

    [JsonIgnore]
    public IBrowsingContextStorageModule Storage => _storageModule ?? Interlocked.CompareExchange(ref _storageModule, new BrowsingContextStorageModule(this, BiDi.Storage), null) ?? _storageModule;

    [JsonIgnore]
    public IBrowsingContextInputModule Input => _inputModule ?? Interlocked.CompareExchange(ref _inputModule, new BrowsingContextInputModule(this, BiDi.Input, ((BiDi)BiDi).EventDispatcher), null) ?? _inputModule;

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

    [JsonIgnore]
    public IEventSource<NavigationStartedEventArgs> NavigationStarted => _navigationStarted ??= CreateContextEventSource(
        BrowsingContextEvent.NavigationStarted, static (e, ctx) => ctx.Equals(e.Context));
    private ContextEventSource<NavigationStartedEventArgs>? _navigationStarted;

    [JsonIgnore]
    public IEventSource<FragmentNavigatedEventArgs> FragmentNavigated => _fragmentNavigated ??= CreateContextEventSource(
        BrowsingContextEvent.FragmentNavigated, static (e, ctx) => ctx.Equals(e.Context));
    private ContextEventSource<FragmentNavigatedEventArgs>? _fragmentNavigated;

    [JsonIgnore]
    public IEventSource<HistoryUpdatedEventArgs> HistoryUpdated => _historyUpdated ??= CreateContextEventSource(
        BrowsingContextEvent.HistoryUpdated, static (e, ctx) => ctx.Equals(e.Context));
    private ContextEventSource<HistoryUpdatedEventArgs>? _historyUpdated;

    [JsonIgnore]
    public IEventSource<DomContentLoadedEventArgs> DomContentLoaded => _domContentLoaded ??= CreateContextEventSource(
        BrowsingContextEvent.DomContentLoaded, static (e, ctx) => ctx.Equals(e.Context));
    private ContextEventSource<DomContentLoadedEventArgs>? _domContentLoaded;

    [JsonIgnore]
    public IEventSource<LoadEventArgs> Load => _load ??= CreateContextEventSource(
        BrowsingContextEvent.Load, static (e, ctx) => ctx.Equals(e.Context));
    private ContextEventSource<LoadEventArgs>? _load;

    [JsonIgnore]
    public IEventSource<DownloadWillBeginEventArgs> DownloadWillBegin => _downloadWillBegin ??= CreateContextEventSource(
        BrowsingContextEvent.DownloadWillBegin, static (e, ctx) => ctx.Equals(e.Context));
    private ContextEventSource<DownloadWillBeginEventArgs>? _downloadWillBegin;

    [JsonIgnore]
    public IEventSource<DownloadEndEventArgs> DownloadEnd => _downloadEnd ??= CreateContextEventSource(
        BrowsingContextEvent.DownloadEnd, static (e, ctx) => ctx.Equals(e.Context));
    private ContextEventSource<DownloadEndEventArgs>? _downloadEnd;

    [JsonIgnore]
    public IEventSource<NavigationAbortedEventArgs> NavigationAborted => _navigationAborted ??= CreateContextEventSource(
        BrowsingContextEvent.NavigationAborted, static (e, ctx) => ctx.Equals(e.Context));
    private ContextEventSource<NavigationAbortedEventArgs>? _navigationAborted;

    [JsonIgnore]
    public IEventSource<NavigationFailedEventArgs> NavigationFailed => _navigationFailed ??= CreateContextEventSource(
        BrowsingContextEvent.NavigationFailed, static (e, ctx) => ctx.Equals(e.Context));
    private ContextEventSource<NavigationFailedEventArgs>? _navigationFailed;

    [JsonIgnore]
    public IEventSource<NavigationCommittedEventArgs> NavigationCommitted => _navigationCommitted ??= CreateContextEventSource(
        BrowsingContextEvent.NavigationCommitted, static (e, ctx) => ctx.Equals(e.Context));
    private ContextEventSource<NavigationCommittedEventArgs>? _navigationCommitted;

    private ContextEventSource<TEventArgs> CreateContextEventSource<TEventArgs>(
        EventDescriptor<TEventArgs> descriptor,
        Func<TEventArgs, BrowsingContext, bool> filter)
        where TEventArgs : EventArgs
    {
        return new(((BiDi)BiDi).EventDispatcher, descriptor, this, e => filter(e, this));
    }

    public bool Equals(BrowsingContext? other)
    {
        return other is not null && string.Equals(Id, other.Id, StringComparison.Ordinal);
    }

    public override int GetHashCode()
    {
        return StringComparer.Ordinal.GetHashCode(Id);
    }

    [SuppressMessage("CodeQuality", "IDE0051", Justification = "Used by compiler-generated ToString()")]
    private bool PrintMembers(StringBuilder builder)
    {
        builder.Append($"Id = {Id}");
        return true;
    }

    public sealed class Converter : IdentifiableConverter<BrowsingContext>
    {
        protected override BrowsingContext Create(IBiDi bidi, string id) => new(bidi, id);
    }
}
