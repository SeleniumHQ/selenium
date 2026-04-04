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

using System.Text.Json;
using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public sealed class BrowsingContextModule : Module, IBrowsingContextModule
{
    private BrowsingContextJsonSerializerContext _jsonContext = null!;

    public async Task<CreateResult> CreateAsync(ContextType type, CreateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CreateParameters(type, options?.ReferenceContext, options?.Background, options?.UserContext);

        return await ExecuteCommandAsync(new CreateCommand(@params), options, _jsonContext.CreateCommand, _jsonContext.CreateResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<NavigateResult> NavigateAsync(BrowsingContext context, string url, NavigateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new NavigateParameters(context, url, options?.Wait);

        return await ExecuteCommandAsync(new NavigateCommand(@params), options, _jsonContext.NavigateCommand, _jsonContext.NavigateResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ActivateResult> ActivateAsync(BrowsingContext context, ActivateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ActivateParameters(context);

        return await ExecuteCommandAsync(new ActivateCommand(@params), options, _jsonContext.ActivateCommand, _jsonContext.ActivateResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<LocateNodesResult> LocateNodesAsync(BrowsingContext context, Locator locator, LocateNodesOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new LocateNodesParameters(context, locator, options?.MaxNodeCount, options?.SerializationOptions, options?.StartNodes);

        return await ExecuteCommandAsync(new LocateNodesCommand(@params), options, _jsonContext.LocateNodesCommand, _jsonContext.LocateNodesResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<CaptureScreenshotResult> CaptureScreenshotAsync(BrowsingContext context, CaptureScreenshotOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CaptureScreenshotParameters(context, options?.Origin, options?.Format, options?.Clip);

        return await ExecuteCommandAsync(new CaptureScreenshotCommand(@params), options, _jsonContext.CaptureScreenshotCommand, _jsonContext.CaptureScreenshotResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<CloseResult> CloseAsync(BrowsingContext context, CloseOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CloseParameters(context, options?.PromptUnload);

        return await ExecuteCommandAsync(new CloseCommand(@params), options, _jsonContext.CloseCommand, _jsonContext.CloseResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<TraverseHistoryResult> TraverseHistoryAsync(BrowsingContext context, int delta, TraverseHistoryOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new TraverseHistoryParameters(context, delta);

        return await ExecuteCommandAsync(new TraverseHistoryCommand(@params), options, _jsonContext.TraverseHistoryCommand, _jsonContext.TraverseHistoryResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ReloadResult> ReloadAsync(BrowsingContext context, ReloadOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ReloadParameters(context, options?.IgnoreCache, options?.Wait);

        return await ExecuteCommandAsync(new ReloadCommand(@params), options, _jsonContext.ReloadCommand, _jsonContext.ReloadResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetViewportResult> SetViewportAsync(SetViewportOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetViewportParameters(options?.Context, options?.Viewport, options?.DevicePixelRatio, options?.UserContexts);

        return await ExecuteCommandAsync(new SetViewportCommand(@params), options, _jsonContext.SetViewportCommand, _jsonContext.SetViewportResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<GetTreeResult> GetTreeAsync(GetTreeOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new GetTreeParameters(options?.MaxDepth, options?.Root);

        return await ExecuteCommandAsync(new GetTreeCommand(@params), options, _jsonContext.GetTreeCommand, _jsonContext.GetTreeResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<PrintResult> PrintAsync(BrowsingContext context, PrintOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new PrintParameters(context, options?.Background, options?.Margin, options?.Orientation, options?.Page, options?.PageRanges, options?.Scale, options?.ShrinkToFit);

        return await ExecuteCommandAsync(new PrintCommand(@params), options, _jsonContext.PrintCommand, _jsonContext.PrintResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<HandleUserPromptResult> HandleUserPromptAsync(BrowsingContext context, HandleUserPromptOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new HandleUserPromptParameters(context, options?.Accept, options?.UserText);

        return await ExecuteCommandAsync(new HandleUserPromptCommand(@params), options, _jsonContext.HandleUserPromptCommand, _jsonContext.HandleUserPromptResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationStartedAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationStarted", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationStartedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationStarted", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFragmentNavigatedAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.fragmentNavigated", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFragmentNavigatedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.fragmentNavigated", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnHistoryUpdatedAsync(Func<HistoryUpdatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.historyUpdated", handler, CreateHistoryUpdatedEventArgs, options, _jsonContext.HistoryUpdatedEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnHistoryUpdatedAsync(Action<HistoryUpdatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.historyUpdated", handler, CreateHistoryUpdatedEventArgs, options, _jsonContext.HistoryUpdatedEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDomContentLoadedAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.domContentLoaded", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDomContentLoadedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.domContentLoaded", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnLoadAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.load", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnLoadAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.load", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadWillBeginAsync(Func<DownloadWillBeginEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadWillBegin", handler, CreateDownloadWillBeginEventArgs, options, _jsonContext.DownloadWillBeginEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadWillBeginAsync(Action<DownloadWillBeginEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadWillBegin", handler, CreateDownloadWillBeginEventArgs, options, _jsonContext.DownloadWillBeginEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadEndAsync(Func<DownloadEndEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadEnd", handler, CreateDownloadEndEventArgs, options, _jsonContext.DownloadEndEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadEndAsync(Action<DownloadEndEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadEnd", handler, CreateDownloadEndEventArgs, options, _jsonContext.DownloadEndEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationAbortedAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationAborted", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationAbortedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationAborted", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationFailedAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationFailed", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationFailedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationFailed", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationCommittedAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationCommitted", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationCommittedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationCommitted", handler, CreateNavigationEventArgs, options, _jsonContext.NavigationEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextCreatedAsync(Func<ContextCreatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextCreated", handler, CreateContextCreatedEventArgs, options, _jsonContext.BrowsingContextEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextCreatedAsync(Action<ContextCreatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextCreated", handler, CreateContextCreatedEventArgs, options, _jsonContext.BrowsingContextEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextDestroyedAsync(Func<ContextDestroyedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextDestroyed", handler, CreateContextDestroyedEventArgs, options, _jsonContext.BrowsingContextEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextDestroyedAsync(Action<ContextDestroyedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextDestroyed", handler, CreateContextDestroyedEventArgs, options, _jsonContext.BrowsingContextEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptOpenedAsync(Func<UserPromptOpenedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptOpened", handler, CreateUserPromptOpenedEventArgs, options, _jsonContext.UserPromptOpenedEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptOpenedAsync(Action<UserPromptOpenedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptOpened", handler, CreateUserPromptOpenedEventArgs, options, _jsonContext.UserPromptOpenedEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptClosedAsync(Func<UserPromptClosedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptClosed", handler, CreateUserPromptClosedEventArgs, options, _jsonContext.UserPromptClosedEventParams, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptClosedAsync(Action<UserPromptClosedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptClosed", handler, CreateUserPromptClosedEventArgs, options, _jsonContext.UserPromptClosedEventParams, cancellationToken).ConfigureAwait(false);
    }

    private static NavigationEventArgs CreateNavigationEventArgs(NavigationEventParams p) => new(p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext);

    private static HistoryUpdatedEventArgs CreateHistoryUpdatedEventArgs(HistoryUpdatedEventParams p) => new(p.Context, p.Timestamp, p.Url, p.UserContext);

    private static DownloadWillBeginEventArgs CreateDownloadWillBeginEventArgs(DownloadWillBeginEventParams p) => new(p.SuggestedFilename, p.Context, p.Navigation, p.Timestamp, p.Url);

    private static DownloadEndEventArgs CreateDownloadEndEventArgs(DownloadEndEventParams p) => p switch
    {
        DownloadCanceledEventParams c => new DownloadCanceledEventArgs(c.Context, c.Navigation, c.Timestamp, c.Url),
        DownloadCompleteEventParams c => new DownloadCompleteEventArgs(c.Filepath, c.Context, c.Navigation, c.Timestamp, c.Url),
        _ => throw new InvalidOperationException($"Unknown DownloadEndEventParams type: {p.GetType()}")
    };

    private static ContextCreatedEventArgs CreateContextCreatedEventArgs(BrowsingContextEventParams p) => new(p.Children, p.ClientWindow, p.Context, p.OriginalOpener, p.Url, p.UserContext, p.Parent);

    private static ContextDestroyedEventArgs CreateContextDestroyedEventArgs(BrowsingContextEventParams p) => new(p.Children, p.ClientWindow, p.Context, p.OriginalOpener, p.Url, p.UserContext, p.Parent);

    private static UserPromptOpenedEventArgs CreateUserPromptOpenedEventArgs(UserPromptOpenedEventParams p) => new(p.Context, p.Handler, p.Message, p.Type, p.UserContext, p.DefaultValue);

    private static UserPromptClosedEventArgs CreateUserPromptClosedEventArgs(UserPromptClosedEventParams p) => new(p.Context, p.Accepted, p.Type, p.UserContext, p.UserText);

    protected override void Initialize(IBiDi bidi, JsonSerializerOptions jsonSerializerOptions)
    {
        jsonSerializerOptions.Converters.Add(new BrowsingContextConverter(bidi));
        jsonSerializerOptions.Converters.Add(new InternalIdConverter(bidi));
        jsonSerializerOptions.Converters.Add(new HandleConverter(bidi));
        jsonSerializerOptions.Converters.Add(new BrowserUserContextConverter(bidi));

        _jsonContext = new BrowsingContextJsonSerializerContext(jsonSerializerOptions);
    }
}

[JsonSerializable(typeof(ActivateCommand))]
[JsonSerializable(typeof(ActivateResult))]
[JsonSerializable(typeof(CaptureScreenshotCommand))]
[JsonSerializable(typeof(CaptureScreenshotResult))]
[JsonSerializable(typeof(CloseCommand))]
[JsonSerializable(typeof(CloseResult))]
[JsonSerializable(typeof(CreateCommand))]
[JsonSerializable(typeof(CreateResult))]
[JsonSerializable(typeof(GetTreeCommand))]
[JsonSerializable(typeof(GetTreeResult))]
[JsonSerializable(typeof(HandleUserPromptCommand))]
[JsonSerializable(typeof(HandleUserPromptResult))]
[JsonSerializable(typeof(LocateNodesCommand))]
[JsonSerializable(typeof(LocateNodesResult))]
[JsonSerializable(typeof(NavigateCommand))]
[JsonSerializable(typeof(NavigateResult))]
[JsonSerializable(typeof(PrintCommand))]
[JsonSerializable(typeof(PrintResult))]
[JsonSerializable(typeof(ReloadCommand))]
[JsonSerializable(typeof(ReloadResult))]
[JsonSerializable(typeof(SetViewportCommand))]
[JsonSerializable(typeof(SetViewportResult))]
[JsonSerializable(typeof(TraverseHistoryCommand))]
[JsonSerializable(typeof(TraverseHistoryResult))]

[JsonSerializable(typeof(BrowsingContextEventParams))]
[JsonSerializable(typeof(DownloadWillBeginEventParams))]
[JsonSerializable(typeof(DownloadEndEventParams))]
[JsonSerializable(typeof(DownloadCanceledEventParams))]
[JsonSerializable(typeof(DownloadCompleteEventParams))]
[JsonSerializable(typeof(HistoryUpdatedEventParams))]
[JsonSerializable(typeof(NavigationEventParams))]
[JsonSerializable(typeof(UserPromptOpenedEventParams))]
[JsonSerializable(typeof(UserPromptClosedEventParams))]

internal partial class BrowsingContextJsonSerializerContext : JsonSerializerContext;
