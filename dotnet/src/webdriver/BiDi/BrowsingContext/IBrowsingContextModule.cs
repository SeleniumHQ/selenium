// <copyright file="IBrowsingContextModule.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public interface IBrowsingContextModule
{
    Task<ActivateResult> ActivateAsync(BrowsingContext context, ActivateOptions? options = null, CancellationToken cancellationToken = default);
    Task<CaptureScreenshotResult> CaptureScreenshotAsync(BrowsingContext context, CaptureScreenshotOptions? options = null, CancellationToken cancellationToken = default);
    Task<CloseResult> CloseAsync(BrowsingContext context, CloseOptions? options = null, CancellationToken cancellationToken = default);
    Task<CreateResult> CreateAsync(ContextType type, CreateOptions? options = null, CancellationToken cancellationToken = default);
    Task<GetTreeResult> GetTreeAsync(GetTreeOptions? options = null, CancellationToken cancellationToken = default);
    Task<HandleUserPromptResult> HandleUserPromptAsync(BrowsingContext context, HandleUserPromptOptions? options = null, CancellationToken cancellationToken = default);
    Task<LocateNodesResult> LocateNodesAsync(BrowsingContext context, Locator locator, LocateNodesOptions? options = null, CancellationToken cancellationToken = default);
    Task<NavigateResult> NavigateAsync(BrowsingContext context, string url, NavigateOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnContextCreatedAsync(Func<ContextCreatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnContextCreatedAsync(Action<ContextCreatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnContextDestroyedAsync(Func<ContextDestroyedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnContextDestroyedAsync(Action<ContextDestroyedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnDomContentLoadedAsync(Func<DomContentLoadedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnDomContentLoadedAsync(Action<DomContentLoadedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnDownloadEndAsync(Func<DownloadEndEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnDownloadEndAsync(Action<DownloadEndEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnDownloadWillBeginAsync(Func<DownloadWillBeginEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnDownloadWillBeginAsync(Action<DownloadWillBeginEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnFragmentNavigatedAsync(Func<FragmentNavigatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnFragmentNavigatedAsync(Action<FragmentNavigatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnHistoryUpdatedAsync(Func<HistoryUpdatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnHistoryUpdatedAsync(Action<HistoryUpdatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnLoadAsync(Func<LoadEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnLoadAsync(Action<LoadEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnNavigationAbortedAsync(Func<NavigationAbortedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnNavigationAbortedAsync(Action<NavigationAbortedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnNavigationCommittedAsync(Func<NavigationCommittedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnNavigationCommittedAsync(Action<NavigationCommittedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnNavigationFailedAsync(Func<NavigationFailedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnNavigationFailedAsync(Action<NavigationFailedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnNavigationStartedAsync(Func<NavigationStartedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnNavigationStartedAsync(Action<NavigationStartedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnUserPromptClosedAsync(Func<UserPromptClosedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnUserPromptClosedAsync(Action<UserPromptClosedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnUserPromptOpenedAsync(Func<UserPromptOpenedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnUserPromptOpenedAsync(Action<UserPromptOpenedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<PrintResult> PrintAsync(BrowsingContext context, PrintOptions? options = null, CancellationToken cancellationToken = default);
    Task<ReloadResult> ReloadAsync(BrowsingContext context, ReloadOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetViewportResult> SetViewportAsync(SetViewportOptions? options = null, CancellationToken cancellationToken = default);
    Task<TraverseHistoryResult> TraverseHistoryAsync(BrowsingContext context, int delta, TraverseHistoryOptions? options = null, CancellationToken cancellationToken = default);
}
