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
    private static readonly CommandDescriptor<CreateParameters, CreateResult> CreateCommand = new(
        "browsingContext.create", Default.CommandMessageCreateParameters, Default.CreateResult);

    private static readonly CommandDescriptor<NavigateParameters, NavigateResult> NavigateCommand = new(
        "browsingContext.navigate", Default.CommandMessageNavigateParameters, Default.NavigateResult);

    private static readonly CommandDescriptor<ActivateParameters, ActivateResult> ActivateCommand = new(
        "browsingContext.activate", Default.CommandMessageActivateParameters, Default.ActivateResult);

    private static readonly CommandDescriptor<LocateNodesParameters, LocateNodesResult> LocateNodesCommand = new(
        "browsingContext.locateNodes", Default.CommandMessageLocateNodesParameters, Default.LocateNodesResult);

    private static readonly CommandDescriptor<CaptureScreenshotParameters, CaptureScreenshotResult> CaptureScreenshotCommand = new(
        "browsingContext.captureScreenshot", Default.CommandMessageCaptureScreenshotParameters, Default.CaptureScreenshotResult);

    private static readonly CommandDescriptor<CloseParameters, CloseResult> CloseCommand = new(
        "browsingContext.close", Default.CommandMessageCloseParameters, Default.CloseResult);

    private static readonly CommandDescriptor<TraverseHistoryParameters, TraverseHistoryResult> TraverseHistoryCommand = new(
        "browsingContext.traverseHistory", Default.CommandMessageTraverseHistoryParameters, Default.TraverseHistoryResult);

    private static readonly CommandDescriptor<ReloadParameters, ReloadResult> ReloadCommand = new(
        "browsingContext.reload", Default.CommandMessageReloadParameters, Default.ReloadResult);

    private static readonly CommandDescriptor<SetViewportParameters, SetViewportResult> SetViewportCommand = new(
        "browsingContext.setViewport", Default.CommandMessageSetViewportParameters, Default.SetViewportResult);

    private static readonly CommandDescriptor<GetTreeParameters, GetTreeResult> GetTreeCommand = new(
        "browsingContext.getTree", Default.CommandMessageGetTreeParameters, Default.GetTreeResult);

    private static readonly CommandDescriptor<PrintParameters, PrintResult> PrintCommand = new(
        "browsingContext.print", Default.CommandMessagePrintParameters, Default.PrintResult);

    private static readonly CommandDescriptor<HandleUserPromptParameters, HandleUserPromptResult> HandleUserPromptCommand = new(
        "browsingContext.handleUserPrompt", Default.CommandMessageHandleUserPromptParameters, Default.HandleUserPromptResult);

    public async Task<CreateResult> CreateAsync(ContextType type, CreateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CreateParameters(type, options?.ReferenceContext, options?.Background, options?.UserContext);

        return await ExecuteCommandAsync(CreateCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<NavigateResult> NavigateAsync(BrowsingContext context, string url, NavigateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new NavigateParameters(context, url, options?.Wait);

        return await ExecuteCommandAsync(NavigateCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ActivateResult> ActivateAsync(BrowsingContext context, ActivateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ActivateParameters(context);

        return await ExecuteCommandAsync(ActivateCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<LocateNodesResult> LocateNodesAsync(BrowsingContext context, Locator locator, LocateNodesOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new LocateNodesParameters(context, locator, options?.MaxNodeCount, options?.SerializationOptions, options?.StartNodes);

        return await ExecuteCommandAsync(LocateNodesCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<CaptureScreenshotResult> CaptureScreenshotAsync(BrowsingContext context, CaptureScreenshotOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CaptureScreenshotParameters(context, options?.Origin, options?.Format, options?.Clip);

        return await ExecuteCommandAsync(CaptureScreenshotCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<CloseResult> CloseAsync(BrowsingContext context, CloseOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CloseParameters(context, options?.PromptUnload);

        return await ExecuteCommandAsync(CloseCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<TraverseHistoryResult> TraverseHistoryAsync(BrowsingContext context, int delta, TraverseHistoryOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new TraverseHistoryParameters(context, delta);

        return await ExecuteCommandAsync(TraverseHistoryCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ReloadResult> ReloadAsync(BrowsingContext context, ReloadOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ReloadParameters(context, options?.IgnoreCache, options?.Wait);

        return await ExecuteCommandAsync(ReloadCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetViewportResult> SetViewportAsync(SetViewportOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetViewportParameters(options?.Context, options?.Viewport, options?.DevicePixelRatio, options?.UserContexts);

        return await ExecuteCommandAsync(SetViewportCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<GetTreeResult> GetTreeAsync(GetTreeOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new GetTreeParameters(options?.MaxDepth, options?.Root);

        return await ExecuteCommandAsync(GetTreeCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<PrintResult> PrintAsync(BrowsingContext context, PrintOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new PrintParameters(context, options?.Background, options?.Margin, options?.Orientation, options?.Page, options?.PageRanges, options?.Scale, options?.ShrinkToFit);

        return await ExecuteCommandAsync(PrintCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<HandleUserPromptResult> HandleUserPromptAsync(BrowsingContext context, HandleUserPromptOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new HandleUserPromptParameters(context, options?.Accept, options?.UserText);

        return await ExecuteCommandAsync(HandleUserPromptCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationStartedAsync(Func<NavigationStartedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationStarted", handler, CreateNavigationStartedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationStartedAsync(Action<NavigationStartedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationStarted", handler, CreateNavigationStartedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFragmentNavigatedAsync(Func<FragmentNavigatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.fragmentNavigated", handler, CreateFragmentNavigatedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFragmentNavigatedAsync(Action<FragmentNavigatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.fragmentNavigated", handler, CreateFragmentNavigatedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnHistoryUpdatedAsync(Func<HistoryUpdatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.historyUpdated", handler, CreateHistoryUpdatedEventArgs, options, Default.HistoryUpdatedParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnHistoryUpdatedAsync(Action<HistoryUpdatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.historyUpdated", handler, CreateHistoryUpdatedEventArgs, options, Default.HistoryUpdatedParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDomContentLoadedAsync(Func<DomContentLoadedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.domContentLoaded", handler, CreateDomContentLoadedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDomContentLoadedAsync(Action<DomContentLoadedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.domContentLoaded", handler, CreateDomContentLoadedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnLoadAsync(Func<LoadEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.load", handler, CreateLoadEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnLoadAsync(Action<LoadEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.load", handler, CreateLoadEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadWillBeginAsync(Func<DownloadWillBeginEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadWillBegin", handler, CreateDownloadWillBeginEventArgs, options, Default.DownloadWillBeginParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadWillBeginAsync(Action<DownloadWillBeginEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadWillBegin", handler, CreateDownloadWillBeginEventArgs, options, Default.DownloadWillBeginParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadEndAsync(Func<DownloadEndEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadEnd", handler, CreateDownloadEndEventArgs, options, Default.DownloadEndParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadEndAsync(Action<DownloadEndEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadEnd", handler, CreateDownloadEndEventArgs, options, Default.DownloadEndParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationAbortedAsync(Func<NavigationAbortedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationAborted", handler, CreateNavigationAbortedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationAbortedAsync(Action<NavigationAbortedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationAborted", handler, CreateNavigationAbortedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationFailedAsync(Func<NavigationFailedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationFailed", handler, CreateNavigationFailedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationFailedAsync(Action<NavigationFailedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationFailed", handler, CreateNavigationFailedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationCommittedAsync(Func<NavigationCommittedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationCommitted", handler, CreateNavigationCommittedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationCommittedAsync(Action<NavigationCommittedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationCommitted", handler, CreateNavigationCommittedEventArgs, options, Default.NavigationInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextCreatedAsync(Func<ContextCreatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextCreated", handler, CreateContextCreatedEventArgs, options, Default.Info, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextCreatedAsync(Action<ContextCreatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextCreated", handler, CreateContextCreatedEventArgs, options, Default.Info, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextDestroyedAsync(Func<ContextDestroyedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextDestroyed", handler, CreateContextDestroyedEventArgs, options, Default.Info, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextDestroyedAsync(Action<ContextDestroyedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextDestroyed", handler, CreateContextDestroyedEventArgs, options, Default.Info, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptOpenedAsync(Func<UserPromptOpenedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptOpened", handler, CreateUserPromptOpenedEventArgs, options, Default.UserPromptOpenedParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptOpenedAsync(Action<UserPromptOpenedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptOpened", handler, CreateUserPromptOpenedEventArgs, options, Default.UserPromptOpenedParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptClosedAsync(Func<UserPromptClosedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptClosed", handler, CreateUserPromptClosedEventArgs, options, Default.UserPromptClosedParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptClosedAsync(Action<UserPromptClosedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptClosed", handler, CreateUserPromptClosedEventArgs, options, Default.UserPromptClosedParameters, cancellationToken).ConfigureAwait(false);
    }

    private static NavigationStartedEventArgs CreateNavigationStartedEventArgs(IBiDi bidi, NavigationInfo p) => new(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext);

    private static FragmentNavigatedEventArgs CreateFragmentNavigatedEventArgs(IBiDi bidi, NavigationInfo p) => new(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext);

    private static DomContentLoadedEventArgs CreateDomContentLoadedEventArgs(IBiDi bidi, NavigationInfo p) => new(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext);

    private static LoadEventArgs CreateLoadEventArgs(IBiDi bidi, NavigationInfo p) => new(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext);

    private static NavigationAbortedEventArgs CreateNavigationAbortedEventArgs(IBiDi bidi, NavigationInfo p) => new(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext);

    private static NavigationFailedEventArgs CreateNavigationFailedEventArgs(IBiDi bidi, NavigationInfo p) => new(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext);

    private static NavigationCommittedEventArgs CreateNavigationCommittedEventArgs(IBiDi bidi, NavigationInfo p) => new(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext);

    private static HistoryUpdatedEventArgs CreateHistoryUpdatedEventArgs(IBiDi bidi, HistoryUpdatedParameters p) => new(bidi, p.Context, p.Timestamp, p.Url, p.UserContext);

    private static DownloadWillBeginEventArgs CreateDownloadWillBeginEventArgs(IBiDi bidi, DownloadWillBeginParams p) => new(bidi, p.SuggestedFilename, p.Context, p.Navigation, p.Timestamp, p.Url);

    private static DownloadEndEventArgs CreateDownloadEndEventArgs(IBiDi bidi, DownloadEndParams p) => p switch
    {
        DownloadCanceledParams c => new DownloadCanceledEventArgs(bidi, c.Context, c.Navigation, c.Timestamp, c.Url),
        DownloadCompleteParams c => new DownloadCompleteEventArgs(bidi, c.Filepath, c.Context, c.Navigation, c.Timestamp, c.Url),
        _ => throw new BiDiException($"Unknown {nameof(DownloadEndParams)} type: {p.GetType()}")
    };

    private static ContextCreatedEventArgs CreateContextCreatedEventArgs(IBiDi bidi, Info p) => new(bidi, p.Children, p.ClientWindow, p.Context, p.OriginalOpener, p.Url, p.UserContext, p.Parent);

    private static ContextDestroyedEventArgs CreateContextDestroyedEventArgs(IBiDi bidi, Info p) => new(bidi, p.Children, p.ClientWindow, p.Context, p.OriginalOpener, p.Url, p.UserContext, p.Parent);

    private static UserPromptOpenedEventArgs CreateUserPromptOpenedEventArgs(IBiDi bidi, UserPromptOpenedParameters p) => new(bidi, p.Context, p.Handler, p.Message, p.Type, p.UserContext, p.DefaultValue);

    private static UserPromptClosedEventArgs CreateUserPromptClosedEventArgs(IBiDi bidi, UserPromptClosedParameters p) => new(bidi, p.Context, p.Accepted, p.Type, p.UserContext, p.UserText);
}

[JsonSerializable(typeof(CommandMessage<ActivateParameters>))]
[JsonSerializable(typeof(ActivateResult))]
[JsonSerializable(typeof(CommandMessage<CaptureScreenshotParameters>))]
[JsonSerializable(typeof(CaptureScreenshotResult))]
[JsonSerializable(typeof(CommandMessage<CloseParameters>))]
[JsonSerializable(typeof(CloseResult))]
[JsonSerializable(typeof(CommandMessage<CreateParameters>))]
[JsonSerializable(typeof(CreateResult))]
[JsonSerializable(typeof(CommandMessage<GetTreeParameters>))]
[JsonSerializable(typeof(GetTreeResult))]
[JsonSerializable(typeof(CommandMessage<HandleUserPromptParameters>))]
[JsonSerializable(typeof(HandleUserPromptResult))]
[JsonSerializable(typeof(CommandMessage<LocateNodesParameters>))]
[JsonSerializable(typeof(LocateNodesResult))]
[JsonSerializable(typeof(CommandMessage<NavigateParameters>))]
[JsonSerializable(typeof(NavigateResult))]
[JsonSerializable(typeof(CommandMessage<PrintParameters>))]
[JsonSerializable(typeof(PrintResult))]
[JsonSerializable(typeof(CommandMessage<ReloadParameters>))]
[JsonSerializable(typeof(ReloadResult))]
[JsonSerializable(typeof(CommandMessage<SetViewportParameters>))]
[JsonSerializable(typeof(SetViewportResult))]
[JsonSerializable(typeof(CommandMessage<TraverseHistoryParameters>))]
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
