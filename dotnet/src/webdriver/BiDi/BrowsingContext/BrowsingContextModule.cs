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

    private static readonly EventRegistration<NavigationStartedEventArgs, NavigationInfo> s_navigationStartedReg = new(
        BrowsingContextEvent.NavigationStarted,
        static (bidi, p) => new NavigationStartedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    private static readonly EventRegistration<FragmentNavigatedEventArgs, NavigationInfo> s_fragmentNavigatedReg = new(
        BrowsingContextEvent.FragmentNavigated,
        static (bidi, p) => new FragmentNavigatedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    private static readonly EventRegistration<HistoryUpdatedEventArgs, HistoryUpdatedParameters> s_historyUpdatedReg = new(
        BrowsingContextEvent.HistoryUpdated,
        static (bidi, p) => new HistoryUpdatedEventArgs(bidi, p.Context, p.Timestamp, p.Url, p.UserContext),
        Default.HistoryUpdatedParameters);

    private static readonly EventRegistration<DomContentLoadedEventArgs, NavigationInfo> s_domContentLoadedReg = new(
        BrowsingContextEvent.DomContentLoaded,
        static (bidi, p) => new DomContentLoadedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    private static readonly EventRegistration<LoadEventArgs, NavigationInfo> s_loadReg = new(
        BrowsingContextEvent.Load,
        static (bidi, p) => new LoadEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    private static readonly EventRegistration<DownloadWillBeginEventArgs, DownloadWillBeginParams> s_downloadWillBeginReg = new(
        BrowsingContextEvent.DownloadWillBegin,
        static (bidi, p) => new DownloadWillBeginEventArgs(bidi, p.SuggestedFilename, p.Context, p.Navigation, p.Timestamp, p.Url),
        Default.DownloadWillBeginParams);

    private static readonly EventRegistration<DownloadEndEventArgs, DownloadEndParams> s_downloadEndReg = new(
        BrowsingContextEvent.DownloadEnd,
        static (bidi, p) => p switch
        {
            DownloadCanceledParams c => new DownloadCanceledEventArgs(bidi, c.Context, c.Navigation, c.Timestamp, c.Url),
            DownloadCompleteParams c => new DownloadCompleteEventArgs(bidi, c.Filepath, c.Context, c.Navigation, c.Timestamp, c.Url),
            _ => throw new BiDiException($"Unknown {nameof(DownloadEndParams)} type: {p.GetType()}")
        },
        Default.DownloadEndParams);

    private static readonly EventRegistration<NavigationAbortedEventArgs, NavigationInfo> s_navigationAbortedReg = new(
        BrowsingContextEvent.NavigationAborted,
        static (bidi, p) => new NavigationAbortedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    private static readonly EventRegistration<NavigationFailedEventArgs, NavigationInfo> s_navigationFailedReg = new(
        BrowsingContextEvent.NavigationFailed,
        static (bidi, p) => new NavigationFailedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    private static readonly EventRegistration<NavigationCommittedEventArgs, NavigationInfo> s_navigationCommittedReg = new(
        BrowsingContextEvent.NavigationCommitted,
        static (bidi, p) => new NavigationCommittedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    private static readonly EventRegistration<ContextCreatedEventArgs, Info> s_contextCreatedReg = new(
        BrowsingContextEvent.ContextCreated,
        static (bidi, p) => new ContextCreatedEventArgs(bidi, p.Children, p.ClientWindow, p.Context, p.OriginalOpener, p.Url, p.UserContext, p.Parent),
        Default.Info);

    private static readonly EventRegistration<ContextDestroyedEventArgs, Info> s_contextDestroyedReg = new(
        BrowsingContextEvent.ContextDestroyed,
        static (bidi, p) => new ContextDestroyedEventArgs(bidi, p.Children, p.ClientWindow, p.Context, p.OriginalOpener, p.Url, p.UserContext, p.Parent),
        Default.Info);

    private static readonly EventRegistration<UserPromptOpenedEventArgs, UserPromptOpenedParameters> s_userPromptOpenedReg = new(
        BrowsingContextEvent.UserPromptOpened,
        static (bidi, p) => new UserPromptOpenedEventArgs(bidi, p.Context, p.Handler, p.Message, p.Type, p.UserContext, p.DefaultValue),
        Default.UserPromptOpenedParameters);

    private static readonly EventRegistration<UserPromptClosedEventArgs, UserPromptClosedParameters> s_userPromptClosedReg = new(
        BrowsingContextEvent.UserPromptClosed,
        static (bidi, p) => new UserPromptClosedEventArgs(bidi, p.Context, p.Accepted, p.Type, p.UserContext, p.UserText),
        Default.UserPromptClosedParameters);

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

    public EventSource<NavigationStartedEventArgs> NavigationStartedEvent => _navigationStarted ?? Interlocked.CompareExchange(ref _navigationStarted, CreateEventSource(s_navigationStartedReg), null) ?? _navigationStarted;
    private EventSource<NavigationStartedEventArgs>? _navigationStarted;

    public EventSource<FragmentNavigatedEventArgs> FragmentNavigatedEvent => _fragmentNavigated ?? Interlocked.CompareExchange(ref _fragmentNavigated, CreateEventSource(s_fragmentNavigatedReg), null) ?? _fragmentNavigated;
    private EventSource<FragmentNavigatedEventArgs>? _fragmentNavigated;

    public EventSource<HistoryUpdatedEventArgs> HistoryUpdatedEvent => _historyUpdated ?? Interlocked.CompareExchange(ref _historyUpdated, CreateEventSource(s_historyUpdatedReg), null) ?? _historyUpdated;
    private EventSource<HistoryUpdatedEventArgs>? _historyUpdated;

    public EventSource<DomContentLoadedEventArgs> DomContentLoadedEvent => _domContentLoaded ?? Interlocked.CompareExchange(ref _domContentLoaded, CreateEventSource(s_domContentLoadedReg), null) ?? _domContentLoaded;
    private EventSource<DomContentLoadedEventArgs>? _domContentLoaded;

    public EventSource<LoadEventArgs> LoadEvent => _load ?? Interlocked.CompareExchange(ref _load, CreateEventSource(s_loadReg), null) ?? _load;
    private EventSource<LoadEventArgs>? _load;

    public EventSource<DownloadWillBeginEventArgs> DownloadWillBeginEvent => _downloadWillBegin ?? Interlocked.CompareExchange(ref _downloadWillBegin, CreateEventSource(s_downloadWillBeginReg), null) ?? _downloadWillBegin;
    private EventSource<DownloadWillBeginEventArgs>? _downloadWillBegin;

    public EventSource<DownloadEndEventArgs> DownloadEndEvent => _downloadEnd ?? Interlocked.CompareExchange(ref _downloadEnd, CreateEventSource(s_downloadEndReg), null) ?? _downloadEnd;
    private EventSource<DownloadEndEventArgs>? _downloadEnd;

    public EventSource<NavigationAbortedEventArgs> NavigationAbortedEvent => _navigationAborted ?? Interlocked.CompareExchange(ref _navigationAborted, CreateEventSource(s_navigationAbortedReg), null) ?? _navigationAborted;
    private EventSource<NavigationAbortedEventArgs>? _navigationAborted;

    public EventSource<NavigationFailedEventArgs> NavigationFailedEvent => _navigationFailed ?? Interlocked.CompareExchange(ref _navigationFailed, CreateEventSource(s_navigationFailedReg), null) ?? _navigationFailed;
    private EventSource<NavigationFailedEventArgs>? _navigationFailed;

    public EventSource<NavigationCommittedEventArgs> NavigationCommittedEvent => _navigationCommitted ?? Interlocked.CompareExchange(ref _navigationCommitted, CreateEventSource(s_navigationCommittedReg), null) ?? _navigationCommitted;
    private EventSource<NavigationCommittedEventArgs>? _navigationCommitted;

    public EventSource<ContextCreatedEventArgs> ContextCreatedEvent => _contextCreated ?? Interlocked.CompareExchange(ref _contextCreated, CreateEventSource(s_contextCreatedReg), null) ?? _contextCreated;
    private EventSource<ContextCreatedEventArgs>? _contextCreated;

    public EventSource<ContextDestroyedEventArgs> ContextDestroyedEvent => _contextDestroyed ?? Interlocked.CompareExchange(ref _contextDestroyed, CreateEventSource(s_contextDestroyedReg), null) ?? _contextDestroyed;
    private EventSource<ContextDestroyedEventArgs>? _contextDestroyed;

    public EventSource<UserPromptOpenedEventArgs> UserPromptOpenedEvent => _userPromptOpened ?? Interlocked.CompareExchange(ref _userPromptOpened, CreateEventSource(s_userPromptOpenedReg), null) ?? _userPromptOpened;
    private EventSource<UserPromptOpenedEventArgs>? _userPromptOpened;

    public EventSource<UserPromptClosedEventArgs> UserPromptClosedEvent => _userPromptClosed ?? Interlocked.CompareExchange(ref _userPromptClosed, CreateEventSource(s_userPromptClosedReg), null) ?? _userPromptClosed;
    private EventSource<UserPromptClosedEventArgs>? _userPromptClosed;
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
