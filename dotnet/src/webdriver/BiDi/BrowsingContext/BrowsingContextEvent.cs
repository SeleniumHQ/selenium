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

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public static class BrowsingContextEvent
{
    public static EventDescriptor<NavigationStartedEventArgs> NavigationStarted { get; } = new("browsingContext.navigationStarted");
    public static EventDescriptor<FragmentNavigatedEventArgs> FragmentNavigated { get; } = new("browsingContext.fragmentNavigated");
    public static EventDescriptor<HistoryUpdatedEventArgs> HistoryUpdated { get; } = new("browsingContext.historyUpdated");
    public static EventDescriptor<DomContentLoadedEventArgs> DomContentLoaded { get; } = new("browsingContext.domContentLoaded");
    public static EventDescriptor<LoadEventArgs> Load { get; } = new("browsingContext.load");
    public static EventDescriptor<DownloadWillBeginEventArgs> DownloadWillBegin { get; } = new("browsingContext.downloadWillBegin");
    public static EventDescriptor<DownloadEndEventArgs> DownloadEnd { get; } = new("browsingContext.downloadEnd");
    public static EventDescriptor<NavigationAbortedEventArgs> NavigationAborted { get; } = new("browsingContext.navigationAborted");
    public static EventDescriptor<NavigationFailedEventArgs> NavigationFailed { get; } = new("browsingContext.navigationFailed");
    public static EventDescriptor<NavigationCommittedEventArgs> NavigationCommitted { get; } = new("browsingContext.navigationCommitted");
    public static EventDescriptor<ContextCreatedEventArgs> ContextCreated { get; } = new("browsingContext.contextCreated");
    public static EventDescriptor<ContextDestroyedEventArgs> ContextDestroyed { get; } = new("browsingContext.contextDestroyed");
    public static EventDescriptor<UserPromptOpenedEventArgs> UserPromptOpened { get; } = new("browsingContext.userPromptOpened");
    public static EventDescriptor<UserPromptClosedEventArgs> UserPromptClosed { get; } = new("browsingContext.userPromptClosed");
}
