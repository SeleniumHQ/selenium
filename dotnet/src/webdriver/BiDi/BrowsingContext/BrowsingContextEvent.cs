// <copyright file="BrowsingContextEvent.cs" company="Selenium Committers">
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

using static OpenQA.Selenium.BiDi.BrowsingContext.BrowsingContextJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public static class BrowsingContextEvent
{
    public static EventDescriptor<NavigationStartedEventArgs> NavigationStarted { get; } = EventDescriptor<NavigationStartedEventArgs>.Create(
        "browsingContext.navigationStarted",
        Default.NavigationStartedEventArgs);

    public static EventDescriptor<FragmentNavigatedEventArgs> FragmentNavigated { get; } = EventDescriptor<FragmentNavigatedEventArgs>.Create(
        "browsingContext.fragmentNavigated",
        Default.FragmentNavigatedEventArgs);

    public static EventDescriptor<HistoryUpdatedEventArgs> HistoryUpdated { get; } = EventDescriptor<HistoryUpdatedEventArgs>.Create(
        "browsingContext.historyUpdated",
        Default.HistoryUpdatedEventArgs);

    public static EventDescriptor<DomContentLoadedEventArgs> DomContentLoaded { get; } = EventDescriptor<DomContentLoadedEventArgs>.Create(
        "browsingContext.domContentLoaded",
        Default.DomContentLoadedEventArgs);

    public static EventDescriptor<LoadEventArgs> Load { get; } = EventDescriptor<LoadEventArgs>.Create(
        "browsingContext.load",
        Default.LoadEventArgs);

    public static EventDescriptor<DownloadWillBeginEventArgs> DownloadWillBegin { get; } = EventDescriptor<DownloadWillBeginEventArgs>.Create(
        "browsingContext.downloadWillBegin",
        Default.DownloadWillBeginEventArgs);

    public static EventDescriptor<DownloadEndEventArgs> DownloadEnd { get; } = EventDescriptor<DownloadEndEventArgs>.Create(
        "browsingContext.downloadEnd",
        Default.DownloadEndEventArgs);

    public static EventDescriptor<NavigationAbortedEventArgs> NavigationAborted { get; } = EventDescriptor<NavigationAbortedEventArgs>.Create(
        "browsingContext.navigationAborted",
        Default.NavigationAbortedEventArgs);

    public static EventDescriptor<NavigationFailedEventArgs> NavigationFailed { get; } = EventDescriptor<NavigationFailedEventArgs>.Create(
        "browsingContext.navigationFailed",
        Default.NavigationFailedEventArgs);

    public static EventDescriptor<NavigationCommittedEventArgs> NavigationCommitted { get; } = EventDescriptor<NavigationCommittedEventArgs>.Create(
        "browsingContext.navigationCommitted",
        Default.NavigationCommittedEventArgs);

    public static EventDescriptor<ContextCreatedEventArgs> ContextCreated { get; } = EventDescriptor<ContextCreatedEventArgs>.Create(
        "browsingContext.contextCreated",
        Default.ContextCreatedEventArgs);

    public static EventDescriptor<ContextDestroyedEventArgs> ContextDestroyed { get; } = EventDescriptor<ContextDestroyedEventArgs>.Create(
        "browsingContext.contextDestroyed",
        Default.ContextDestroyedEventArgs);

    public static EventDescriptor<UserPromptOpenedEventArgs> UserPromptOpened { get; } = EventDescriptor<UserPromptOpenedEventArgs>.Create(
        "browsingContext.userPromptOpened",
        Default.UserPromptOpenedEventArgs);

    public static EventDescriptor<UserPromptClosedEventArgs> UserPromptClosed { get; } = EventDescriptor<UserPromptClosedEventArgs>.Create(
        "browsingContext.userPromptClosed",
        Default.UserPromptClosedEventArgs);
}
