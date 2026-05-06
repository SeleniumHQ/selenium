// <copyright file="BrowsingContextModule.cs" company="Selenium Committers">
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

using System.Text.Json.Serialization;
using static OpenQA.Selenium.BiDi.BrowsingContext.BrowsingContextJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

internal sealed class BrowsingContextModule : Module, IBrowsingContextModule
{
    private static readonly Command<CreateParameters, CreateResult> CreateCommand = new(
        "browsingContext.create", Default.CreateParameters, Default.CreateResult);

    private static readonly Command<NavigateParameters, NavigateResult> NavigateCommand = new(
        "browsingContext.navigate", Default.NavigateParameters, Default.NavigateResult);

    private static readonly Command<ActivateParameters, ActivateResult> ActivateCommand = new(
        "browsingContext.activate", Default.ActivateParameters, Default.ActivateResult);

    private static readonly Command<LocateNodesParameters, LocateNodesResult> LocateNodesCommand = new(
        "browsingContext.locateNodes", Default.LocateNodesParameters, Default.LocateNodesResult);

    private static readonly Command<CaptureScreenshotParameters, CaptureScreenshotResult> CaptureScreenshotCommand = new(
        "browsingContext.captureScreenshot", Default.CaptureScreenshotParameters, Default.CaptureScreenshotResult);

    private static readonly Command<CloseParameters, CloseResult> CloseCommand = new(
        "browsingContext.close", Default.CloseParameters, Default.CloseResult);

    private static readonly Command<TraverseHistoryParameters, TraverseHistoryResult> TraverseHistoryCommand = new(
        "browsingContext.traverseHistory", Default.TraverseHistoryParameters, Default.TraverseHistoryResult);

    private static readonly Command<ReloadParameters, ReloadResult> ReloadCommand = new(
        "browsingContext.reload", Default.ReloadParameters, Default.ReloadResult);

    private static readonly Command<SetViewportParameters, SetViewportResult> SetViewportCommand = new(
        "browsingContext.setViewport", Default.SetViewportParameters, Default.SetViewportResult);

    private static readonly Command<GetTreeParameters, GetTreeResult> GetTreeCommand = new(
        "browsingContext.getTree", Default.GetTreeParameters, Default.GetTreeResult);

    private static readonly Command<PrintParameters, PrintResult> PrintCommand = new(
        "browsingContext.print", Default.PrintParameters, Default.PrintResult);

    private static readonly Command<HandleUserPromptParameters, HandleUserPromptResult> HandleUserPromptCommand = new(
        "browsingContext.handleUserPrompt", Default.HandleUserPromptParameters, Default.HandleUserPromptResult);

    public async Task<CreateResult> CreateAsync(ContextType type, CreateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CreateParameters(type, options?.ReferenceContext, options?.Background, options?.UserContext);

        return await ExecuteAsync(CreateCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<NavigateResult> NavigateAsync(BrowsingContext context, string url, NavigateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new NavigateParameters(context, url, options?.Wait);

        return await ExecuteAsync(NavigateCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ActivateResult> ActivateAsync(BrowsingContext context, ActivateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ActivateParameters(context);

        return await ExecuteAsync(ActivateCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<LocateNodesResult> LocateNodesAsync(BrowsingContext context, Locator locator, LocateNodesOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new LocateNodesParameters(context, locator, options?.MaxNodeCount, options?.SerializationOptions, options?.StartNodes);

        return await ExecuteAsync(LocateNodesCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<CaptureScreenshotResult> CaptureScreenshotAsync(BrowsingContext context, CaptureScreenshotOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CaptureScreenshotParameters(context, options?.Origin, options?.Format, options?.Clip);

        return await ExecuteAsync(CaptureScreenshotCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<CloseResult> CloseAsync(BrowsingContext context, CloseOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CloseParameters(context, options?.PromptUnload);

        return await ExecuteAsync(CloseCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<TraverseHistoryResult> TraverseHistoryAsync(BrowsingContext context, int delta, TraverseHistoryOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new TraverseHistoryParameters(context, delta);

        return await ExecuteAsync(TraverseHistoryCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ReloadResult> ReloadAsync(BrowsingContext context, ReloadOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ReloadParameters(context, options?.IgnoreCache, options?.Wait);

        return await ExecuteAsync(ReloadCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetViewportResult> SetViewportAsync(SetViewportOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetViewportParameters(options?.Context, options?.Viewport, options?.DevicePixelRatio, options?.UserContexts);

        return await ExecuteAsync(SetViewportCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<GetTreeResult> GetTreeAsync(GetTreeOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new GetTreeParameters(options?.MaxDepth, options?.Root);

        return await ExecuteAsync(GetTreeCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<PrintResult> PrintAsync(BrowsingContext context, PrintOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new PrintParameters(context, options?.Background, options?.Margin, options?.Orientation, options?.Page, options?.PageRanges, options?.Scale, options?.ShrinkToFit);

        return await ExecuteAsync(PrintCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<HandleUserPromptResult> HandleUserPromptAsync(BrowsingContext context, HandleUserPromptOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new HandleUserPromptParameters(context, options?.Accept, options?.UserText);

        return await ExecuteAsync(HandleUserPromptCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public IEventSource<NavigationStartedEventArgs> NavigationStarted => _navigationStarted ?? Interlocked.CompareExchange(ref _navigationStarted, CreateEventSource(BrowsingContextEvent.NavigationStarted), null) ?? _navigationStarted;
    private IEventSource<NavigationStartedEventArgs>? _navigationStarted;

    public IEventSource<FragmentNavigatedEventArgs> FragmentNavigated => _fragmentNavigated ?? Interlocked.CompareExchange(ref _fragmentNavigated, CreateEventSource(BrowsingContextEvent.FragmentNavigated), null) ?? _fragmentNavigated;
    private IEventSource<FragmentNavigatedEventArgs>? _fragmentNavigated;

    public IEventSource<HistoryUpdatedEventArgs> HistoryUpdated => _historyUpdated ?? Interlocked.CompareExchange(ref _historyUpdated, CreateEventSource(BrowsingContextEvent.HistoryUpdated), null) ?? _historyUpdated;
    private IEventSource<HistoryUpdatedEventArgs>? _historyUpdated;

    public IEventSource<DomContentLoadedEventArgs> DomContentLoaded => _domContentLoaded ?? Interlocked.CompareExchange(ref _domContentLoaded, CreateEventSource(BrowsingContextEvent.DomContentLoaded), null) ?? _domContentLoaded;
    private IEventSource<DomContentLoadedEventArgs>? _domContentLoaded;

    public IEventSource<LoadEventArgs> Load => _load ?? Interlocked.CompareExchange(ref _load, CreateEventSource(BrowsingContextEvent.Load), null) ?? _load;
    private IEventSource<LoadEventArgs>? _load;

    public IEventSource<DownloadWillBeginEventArgs> DownloadWillBegin => _downloadWillBegin ?? Interlocked.CompareExchange(ref _downloadWillBegin, CreateEventSource(BrowsingContextEvent.DownloadWillBegin), null) ?? _downloadWillBegin;
    private IEventSource<DownloadWillBeginEventArgs>? _downloadWillBegin;

    public IEventSource<DownloadEndEventArgs> DownloadEnd => _downloadEnd ?? Interlocked.CompareExchange(ref _downloadEnd, CreateEventSource(BrowsingContextEvent.DownloadEnd), null) ?? _downloadEnd;
    private IEventSource<DownloadEndEventArgs>? _downloadEnd;

    public IEventSource<NavigationAbortedEventArgs> NavigationAborted => _navigationAborted ?? Interlocked.CompareExchange(ref _navigationAborted, CreateEventSource(BrowsingContextEvent.NavigationAborted), null) ?? _navigationAborted;
    private IEventSource<NavigationAbortedEventArgs>? _navigationAborted;

    public IEventSource<NavigationFailedEventArgs> NavigationFailed => _navigationFailed ?? Interlocked.CompareExchange(ref _navigationFailed, CreateEventSource(BrowsingContextEvent.NavigationFailed), null) ?? _navigationFailed;
    private IEventSource<NavigationFailedEventArgs>? _navigationFailed;

    public IEventSource<NavigationCommittedEventArgs> NavigationCommitted => _navigationCommitted ?? Interlocked.CompareExchange(ref _navigationCommitted, CreateEventSource(BrowsingContextEvent.NavigationCommitted), null) ?? _navigationCommitted;
    private IEventSource<NavigationCommittedEventArgs>? _navigationCommitted;

    public IEventSource<ContextCreatedEventArgs> ContextCreated => _contextCreated ?? Interlocked.CompareExchange(ref _contextCreated, CreateEventSource(BrowsingContextEvent.ContextCreated), null) ?? _contextCreated;
    private IEventSource<ContextCreatedEventArgs>? _contextCreated;

    public IEventSource<ContextDestroyedEventArgs> ContextDestroyed => _contextDestroyed ?? Interlocked.CompareExchange(ref _contextDestroyed, CreateEventSource(BrowsingContextEvent.ContextDestroyed), null) ?? _contextDestroyed;
    private IEventSource<ContextDestroyedEventArgs>? _contextDestroyed;

    public IEventSource<UserPromptOpenedEventArgs> UserPromptOpened => _userPromptOpened ?? Interlocked.CompareExchange(ref _userPromptOpened, CreateEventSource(BrowsingContextEvent.UserPromptOpened), null) ?? _userPromptOpened;
    private IEventSource<UserPromptOpenedEventArgs>? _userPromptOpened;

    public IEventSource<UserPromptClosedEventArgs> UserPromptClosed => _userPromptClosed ?? Interlocked.CompareExchange(ref _userPromptClosed, CreateEventSource(BrowsingContextEvent.UserPromptClosed), null) ?? _userPromptClosed;
    private IEventSource<UserPromptClosedEventArgs>? _userPromptClosed;
}

[JsonSerializable(typeof(ActivateParameters))]
[JsonSerializable(typeof(ActivateResult))]
[JsonSerializable(typeof(CaptureScreenshotParameters))]
[JsonSerializable(typeof(CaptureScreenshotResult))]
[JsonSerializable(typeof(CloseParameters))]
[JsonSerializable(typeof(CloseResult))]
[JsonSerializable(typeof(CreateParameters))]
[JsonSerializable(typeof(CreateResult))]
[JsonSerializable(typeof(GetTreeParameters))]
[JsonSerializable(typeof(GetTreeResult))]
[JsonSerializable(typeof(HandleUserPromptParameters))]
[JsonSerializable(typeof(HandleUserPromptResult))]
[JsonSerializable(typeof(LocateNodesParameters))]
[JsonSerializable(typeof(LocateNodesResult))]
[JsonSerializable(typeof(NavigateParameters))]
[JsonSerializable(typeof(NavigateResult))]
[JsonSerializable(typeof(PrintParameters))]
[JsonSerializable(typeof(PrintResult))]
[JsonSerializable(typeof(ReloadParameters))]
[JsonSerializable(typeof(ReloadResult))]
[JsonSerializable(typeof(SetViewportParameters))]
[JsonSerializable(typeof(SetViewportResult))]
[JsonSerializable(typeof(TraverseHistoryParameters))]
[JsonSerializable(typeof(TraverseHistoryResult))]

[JsonSerializable(typeof(DownloadWillBeginParams))]
[JsonSerializable(typeof(DownloadEndParams))]
[JsonSerializable(typeof(DownloadCanceledParams))]
[JsonSerializable(typeof(DownloadCompleteParams))]
[JsonSerializable(typeof(HistoryUpdatedParameters))]
[JsonSerializable(typeof(NavigationInfo))]
[JsonSerializable(typeof(UserPromptClosedParameters))]
[JsonSerializable(typeof(UserPromptOpenedParameters))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class BrowsingContextJsonSerializerContext : JsonSerializerContext;
