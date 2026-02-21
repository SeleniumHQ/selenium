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

public sealed class BrowsingContextModule : Module
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
        return await SubscribeAsync("browsingContext.navigationStarted", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationStartedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationStarted", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFragmentNavigatedAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.fragmentNavigated", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFragmentNavigatedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.fragmentNavigated", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnHistoryUpdatedAsync(Func<HistoryUpdatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.historyUpdated", handler, options, _jsonContext.HistoryUpdatedEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnHistoryUpdatedAsync(Action<HistoryUpdatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.historyUpdated", handler, options, _jsonContext.HistoryUpdatedEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDomContentLoadedAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.domContentLoaded", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDomContentLoadedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.domContentLoaded", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnLoadAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.load", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnLoadAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.load", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadWillBeginAsync(Func<DownloadWillBeginEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadWillBegin", handler, options, _jsonContext.DownloadWillBeginEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadWillBeginAsync(Action<DownloadWillBeginEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadWillBegin", handler, options, _jsonContext.DownloadWillBeginEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadEndAsync(Func<DownloadEndEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadEnd", handler, options, _jsonContext.DownloadEndEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadEndAsync(Action<DownloadEndEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.downloadEnd", handler, options, _jsonContext.DownloadEndEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationAbortedAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationAborted", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationAbortedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationAborted", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationFailedAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationFailed", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationFailedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationFailed", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationCommittedAsync(Func<NavigationEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationCommitted", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationCommittedAsync(Action<NavigationEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.navigationCommitted", handler, options, _jsonContext.NavigationEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextCreatedAsync(Func<BrowsingContextEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextCreated", handler, options, _jsonContext.BrowsingContextEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextCreatedAsync(Action<BrowsingContextEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextCreated", handler, options, _jsonContext.BrowsingContextEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextDestroyedAsync(Func<BrowsingContextEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextDestroyed", handler, options, _jsonContext.BrowsingContextEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextDestroyedAsync(Action<BrowsingContextEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.contextDestroyed", handler, options, _jsonContext.BrowsingContextEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptOpenedAsync(Func<UserPromptOpenedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptOpened", handler, options, _jsonContext.UserPromptOpenedEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptOpenedAsync(Action<UserPromptOpenedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptOpened", handler, options, _jsonContext.UserPromptOpenedEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptClosedAsync(Func<UserPromptClosedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptClosed", handler, options, _jsonContext.UserPromptClosedEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptClosedAsync(Action<UserPromptClosedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("browsingContext.userPromptClosed", handler, options, _jsonContext.UserPromptClosedEventArgs, cancellationToken).ConfigureAwait(false);
    }

    protected override void Initialize(BiDi bidi, JsonSerializerOptions jsonSerializerOptions)
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

[JsonSerializable(typeof(BrowsingContextEventArgs))]
[JsonSerializable(typeof(DownloadWillBeginEventArgs))]
[JsonSerializable(typeof(DownloadEndEventArgs))]
[JsonSerializable(typeof(DownloadCanceledEventArgs))]
[JsonSerializable(typeof(DownloadCompleteEventArgs))]
[JsonSerializable(typeof(HistoryUpdatedEventArgs))]
[JsonSerializable(typeof(NavigationEventArgs))]
[JsonSerializable(typeof(UserPromptOpenedEventArgs))]
[JsonSerializable(typeof(UserPromptClosedEventArgs))]

internal partial class BrowsingContextJsonSerializerContext : JsonSerializerContext;
