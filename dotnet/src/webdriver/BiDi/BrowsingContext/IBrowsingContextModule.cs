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
    IEventSource<ContextCreatedEventArgs> ContextCreated { get; }
    IEventSource<ContextDestroyedEventArgs> ContextDestroyed { get; }
    IEventSource<DomContentLoadedEventArgs> DomContentLoaded { get; }
    IEventSource<DownloadEndEventArgs> DownloadEnd { get; }
    IEventSource<DownloadWillBeginEventArgs> DownloadWillBegin { get; }
    IEventSource<FragmentNavigatedEventArgs> FragmentNavigated { get; }
    IEventSource<HistoryUpdatedEventArgs> HistoryUpdated { get; }
    IEventSource<LoadEventArgs> Load { get; }
    IEventSource<NavigationAbortedEventArgs> NavigationAborted { get; }
    IEventSource<NavigationCommittedEventArgs> NavigationCommitted { get; }
    IEventSource<NavigationFailedEventArgs> NavigationFailed { get; }
    IEventSource<NavigationStartedEventArgs> NavigationStarted { get; }
    IEventSource<UserPromptClosedEventArgs> UserPromptClosed { get; }
    IEventSource<UserPromptOpenedEventArgs> UserPromptOpened { get; }
    Task<PrintResult> PrintAsync(BrowsingContext context, PrintOptions? options = null, CancellationToken cancellationToken = default);
    Task<ReloadResult> ReloadAsync(BrowsingContext context, ReloadOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetViewportResult> SetViewportAsync(SetViewportOptions? options = null, CancellationToken cancellationToken = default);
    Task<TraverseHistoryResult> TraverseHistoryAsync(BrowsingContext context, int delta, TraverseHistoryOptions? options = null, CancellationToken cancellationToken = default);
}
