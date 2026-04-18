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
    public static EventDescriptor<NavigationStartedEventArgs> NavigationStarted { get; } = EventDescriptor<NavigationStartedEventArgs>.Create<NavigationInfo>(
        "browsingContext.navigationStarted",
        static (bidi, p) => new NavigationStartedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    public static EventDescriptor<FragmentNavigatedEventArgs> FragmentNavigated { get; } = EventDescriptor<FragmentNavigatedEventArgs>.Create<NavigationInfo>(
        "browsingContext.fragmentNavigated",
        static (bidi, p) => new FragmentNavigatedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    public static EventDescriptor<HistoryUpdatedEventArgs> HistoryUpdated { get; } = EventDescriptor<HistoryUpdatedEventArgs>.Create<HistoryUpdatedParameters>(
        "browsingContext.historyUpdated",
        static (bidi, p) => new HistoryUpdatedEventArgs(bidi, p.Context, p.Timestamp, p.Url, p.UserContext),
        Default.HistoryUpdatedParameters);

    public static EventDescriptor<DomContentLoadedEventArgs> DomContentLoaded { get; } = EventDescriptor<DomContentLoadedEventArgs>.Create<NavigationInfo>(
        "browsingContext.domContentLoaded",
        static (bidi, p) => new DomContentLoadedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    public static EventDescriptor<LoadEventArgs> Load { get; } = EventDescriptor<LoadEventArgs>.Create<NavigationInfo>(
        "browsingContext.load",
        static (bidi, p) => new LoadEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    public static EventDescriptor<DownloadWillBeginEventArgs> DownloadWillBegin { get; } = EventDescriptor<DownloadWillBeginEventArgs>.Create<DownloadWillBeginParams>(
        "browsingContext.downloadWillBegin",
        static (bidi, p) => new DownloadWillBeginEventArgs(bidi, p.SuggestedFilename, p.Context, p.Navigation, p.Timestamp, p.Url),
        Default.DownloadWillBeginParams);

    public static EventDescriptor<DownloadEndEventArgs> DownloadEnd { get; } = EventDescriptor<DownloadEndEventArgs>.Create<DownloadEndParams>(
        "browsingContext.downloadEnd",
        static (bidi, p) => p switch
        {
            DownloadCanceledParams c => new DownloadCanceledEventArgs(bidi, c.Context, c.Navigation, c.Timestamp, c.Url),
            DownloadCompleteParams c => new DownloadCompleteEventArgs(bidi, c.Filepath, c.Context, c.Navigation, c.Timestamp, c.Url),
            _ => throw new BiDiException($"Unknown {nameof(DownloadEndParams)} type: {p.GetType()}")
        },
        Default.DownloadEndParams);

    public static EventDescriptor<NavigationAbortedEventArgs> NavigationAborted { get; } = EventDescriptor<NavigationAbortedEventArgs>.Create<NavigationInfo>(
        "browsingContext.navigationAborted",
        static (bidi, p) => new NavigationAbortedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    public static EventDescriptor<NavigationFailedEventArgs> NavigationFailed { get; } = EventDescriptor<NavigationFailedEventArgs>.Create<NavigationInfo>(
        "browsingContext.navigationFailed",
        static (bidi, p) => new NavigationFailedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    public static EventDescriptor<NavigationCommittedEventArgs> NavigationCommitted { get; } = EventDescriptor<NavigationCommittedEventArgs>.Create<NavigationInfo>(
        "browsingContext.navigationCommitted",
        static (bidi, p) => new NavigationCommittedEventArgs(bidi, p.Context, p.Navigation, p.Timestamp, p.Url, p.UserContext),
        Default.NavigationInfo);

    public static EventDescriptor<ContextCreatedEventArgs> ContextCreated { get; } = EventDescriptor<ContextCreatedEventArgs>.Create<Info>(
        "browsingContext.contextCreated",
        static (bidi, p) => new ContextCreatedEventArgs(bidi, p.Children, p.ClientWindow, p.Context, p.OriginalOpener, p.Url, p.UserContext, p.Parent),
        Default.Info);

    public static EventDescriptor<ContextDestroyedEventArgs> ContextDestroyed { get; } = EventDescriptor<ContextDestroyedEventArgs>.Create<Info>(
        "browsingContext.contextDestroyed",
        static (bidi, p) => new ContextDestroyedEventArgs(bidi, p.Children, p.ClientWindow, p.Context, p.OriginalOpener, p.Url, p.UserContext, p.Parent),
        Default.Info);

    public static EventDescriptor<UserPromptOpenedEventArgs> UserPromptOpened { get; } = EventDescriptor<UserPromptOpenedEventArgs>.Create<UserPromptOpenedParameters>(
        "browsingContext.userPromptOpened",
        static (bidi, p) => new UserPromptOpenedEventArgs(bidi, p.Context, p.Handler, p.Message, p.Type, p.UserContext, p.DefaultValue),
        Default.UserPromptOpenedParameters);

    public static EventDescriptor<UserPromptClosedEventArgs> UserPromptClosed { get; } = EventDescriptor<UserPromptClosedEventArgs>.Create<UserPromptClosedParameters>(
        "browsingContext.userPromptClosed",
        static (bidi, p) => new UserPromptClosedEventArgs(bidi, p.Context, p.Accepted, p.Type, p.UserContext, p.UserText),
        Default.UserPromptClosedParameters);
}
