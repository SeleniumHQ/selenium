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

using OpenQA.Selenium.BiDi.Json.Converters;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public sealed class BrowsingContextModule : Module
{
    private BrowsingContextJsonSerializerContext _jsonContext = null!;

    public async Task<CreateResult> CreateAsync(ContextType type, CreateOptions? options = null)
    {
        var @params = new CreateParameters(type, options?.ReferenceContext, options?.Background, options?.UserContext);

        return await Broker.ExecuteCommandAsync(new CreateCommand(@params), options, _jsonContext.CreateCommand, _jsonContext.CreateResult).ConfigureAwait(false);
    }

    public async Task<NavigateResult> NavigateAsync(BrowsingContext context, string url, NavigateOptions? options = null)
    {
        var @params = new NavigateParameters(context, url, options?.Wait);

        return await Broker.ExecuteCommandAsync(new NavigateCommand(@params), options, _jsonContext.NavigateCommand, _jsonContext.NavigateResult).ConfigureAwait(false);
    }

    public async Task<ActivateResult> ActivateAsync(BrowsingContext context, ActivateOptions? options = null)
    {
        var @params = new ActivateParameters(context);

        return await Broker.ExecuteCommandAsync(new ActivateCommand(@params), options, _jsonContext.ActivateCommand, _jsonContext.ActivateResult).ConfigureAwait(false);
    }

    public async Task<LocateNodesResult> LocateNodesAsync(BrowsingContext context, Locator locator, LocateNodesOptions? options = null)
    {
        var @params = new LocateNodesParameters(context, locator, options?.MaxNodeCount, options?.SerializationOptions, options?.StartNodes);

        return await Broker.ExecuteCommandAsync(new LocateNodesCommand(@params), options, _jsonContext.LocateNodesCommand, _jsonContext.LocateNodesResult).ConfigureAwait(false);
    }

    public async Task<CaptureScreenshotResult> CaptureScreenshotAsync(BrowsingContext context, CaptureScreenshotOptions? options = null)
    {
        var @params = new CaptureScreenshotParameters(context, options?.Origin, options?.Format, options?.Clip);

        return await Broker.ExecuteCommandAsync(new CaptureScreenshotCommand(@params), options, _jsonContext.CaptureScreenshotCommand, _jsonContext.CaptureScreenshotResult).ConfigureAwait(false);
    }

    public async Task<CloseResult> CloseAsync(BrowsingContext context, CloseOptions? options = null)
    {
        var @params = new CloseParameters(context, options?.PromptUnload);

        return await Broker.ExecuteCommandAsync(new CloseCommand(@params), options, _jsonContext.CloseCommand, _jsonContext.CloseResult).ConfigureAwait(false);
    }

    public async Task<TraverseHistoryResult> TraverseHistoryAsync(BrowsingContext context, int delta, TraverseHistoryOptions? options = null)
    {
        var @params = new TraverseHistoryParameters(context, delta);

        return await Broker.ExecuteCommandAsync(new TraverseHistoryCommand(@params), options, _jsonContext.TraverseHistoryCommand, _jsonContext.TraverseHistoryResult).ConfigureAwait(false);
    }

    public async Task<ReloadResult> ReloadAsync(BrowsingContext context, ReloadOptions? options = null)
    {
        var @params = new ReloadParameters(context, options?.IgnoreCache, options?.Wait);

        return await Broker.ExecuteCommandAsync(new ReloadCommand(@params), options, _jsonContext.ReloadCommand, _jsonContext.ReloadResult).ConfigureAwait(false);
    }

    public async Task<SetViewportResult> SetViewportAsync(BrowsingContext context, SetViewportOptions? options = null)
    {
        var @params = new SetViewportParameters(context, options?.Viewport, options?.DevicePixelRatio);

        return await Broker.ExecuteCommandAsync(new SetViewportCommand(@params), options, _jsonContext.SetViewportCommand, _jsonContext.SetViewportResult).ConfigureAwait(false);
    }

    public async Task<GetTreeResult> GetTreeAsync(GetTreeOptions? options = null)
    {
        var @params = new GetTreeParameters(options?.MaxDepth, options?.Root);

        return await Broker.ExecuteCommandAsync(new GetTreeCommand(@params), options, _jsonContext.GetTreeCommand, _jsonContext.GetTreeResult).ConfigureAwait(false);
    }

    public async Task<PrintResult> PrintAsync(BrowsingContext context, PrintOptions? options = null)
    {
        var @params = new PrintParameters(context, options?.Background, options?.Margin, options?.Orientation, options?.Page, options?.PageRanges, options?.Scale, options?.ShrinkToFit);

        return await Broker.ExecuteCommandAsync(new PrintCommand(@params), options, _jsonContext.PrintCommand, _jsonContext.PrintResult).ConfigureAwait(false);
    }

    public async Task<HandleUserPromptResult> HandleUserPromptAsync(BrowsingContext context, HandleUserPromptOptions? options = null)
    {
        var @params = new HandleUserPromptParameters(context, options?.Accept, options?.UserText);

        return await Broker.ExecuteCommandAsync(new HandleUserPromptCommand(@params), options, _jsonContext.HandleUserPromptCommand, _jsonContext.HandleUserPromptResult).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationStartedAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.navigationStarted", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationStartedAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.navigationStarted", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFragmentNavigatedAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.fragmentNavigated", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFragmentNavigatedAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.fragmentNavigated", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnHistoryUpdatedAsync(Func<HistoryUpdatedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.historyUpdated", handler, options, _jsonContext.HistoryUpdatedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnHistoryUpdatedAsync(Action<HistoryUpdatedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.historyUpdated", handler, options, _jsonContext.HistoryUpdatedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDomContentLoadedAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.domContentLoaded", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDomContentLoadedAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.domContentLoaded", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnLoadAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.load", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnLoadAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.load", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadWillBeginAsync(Func<DownloadWillBeginEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.downloadWillBegin", handler, options, _jsonContext.DownloadWillBeginEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadWillBeginAsync(Action<DownloadWillBeginEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.downloadWillBegin", handler, options, _jsonContext.DownloadWillBeginEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadEndAsync(Func<DownloadEndEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.downloadEnd", handler, options, _jsonContext.DownloadEndEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnDownloadEndAsync(Action<DownloadEndEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.downloadEnd", handler, options, _jsonContext.DownloadEndEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationAbortedAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.navigationAborted", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationAbortedAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.navigationAborted", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationFailedAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.navigationFailed", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationFailedAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.navigationFailed", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationCommittedAsync(Func<NavigationInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.navigationCommitted", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnNavigationCommittedAsync(Action<NavigationInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.navigationCommitted", handler, options, _jsonContext.NavigationInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextCreatedAsync(Func<BrowsingContextInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.contextCreated", handler, options, _jsonContext.BrowsingContextInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextCreatedAsync(Action<BrowsingContextInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.contextCreated", handler, options, _jsonContext.BrowsingContextInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextDestroyedAsync(Func<BrowsingContextInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.contextDestroyed", handler, options, _jsonContext.BrowsingContextInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnContextDestroyedAsync(Action<BrowsingContextInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.contextDestroyed", handler, options, _jsonContext.BrowsingContextInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptOpenedAsync(Func<UserPromptOpenedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.userPromptOpened", handler, options, _jsonContext.UserPromptOpenedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptOpenedAsync(Action<UserPromptOpenedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.userPromptOpened", handler, options, _jsonContext.UserPromptOpenedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptClosedAsync(Func<UserPromptClosedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.userPromptClosed", handler, options, _jsonContext.UserPromptClosedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnUserPromptClosedAsync(Action<UserPromptClosedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("browsingContext.userPromptClosed", handler, options, _jsonContext.UserPromptClosedEventArgs).ConfigureAwait(false);
    }

    protected override void Initialize(JsonSerializerOptions jsonSerializerOptions)
    {
        var browsingContextOptions = new JsonSerializerOptions(jsonSerializerOptions)
        {
            Converters =
            {
                new BrowsingContextConverter(BiDi),
                new InternalIdConverter(BiDi),
                new HandleConverter(BiDi),
                new BrowserUserContextConverter(BiDi),
            }
        };

        _jsonContext = new BrowsingContextJsonSerializerContext(browsingContextOptions);
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

[JsonSerializable(typeof(BrowsingContextInfo))]
[JsonSerializable(typeof(DownloadWillBeginEventArgs))]
[JsonSerializable(typeof(DownloadEndEventArgs))]
[JsonSerializable(typeof(DownloadCanceledEventArgs))]
[JsonSerializable(typeof(DownloadCompleteEventArgs))]
[JsonSerializable(typeof(HistoryUpdatedEventArgs))]
[JsonSerializable(typeof(NavigationInfo))]
[JsonSerializable(typeof(UserPromptOpenedEventArgs))]
[JsonSerializable(typeof(UserPromptClosedEventArgs))]

internal partial class BrowsingContextJsonSerializerContext : JsonSerializerContext;
