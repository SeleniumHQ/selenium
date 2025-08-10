// <copyright file="BiDiJsonSerializerContext.cs" company="Selenium Committers">
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

using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json;

#region https://github.com/dotnet/runtime/issues/72604
[JsonSerializable(typeof(Script.EvaluateResultSuccess))]
[JsonSerializable(typeof(Script.EvaluateResultException))]

[JsonSerializable(typeof(Script.NumberRemoteValue))]
[JsonSerializable(typeof(Script.BooleanRemoteValue))]
[JsonSerializable(typeof(Script.BigIntRemoteValue))]
[JsonSerializable(typeof(Script.StringRemoteValue))]
[JsonSerializable(typeof(Script.NullRemoteValue))]
[JsonSerializable(typeof(Script.UndefinedRemoteValue))]
[JsonSerializable(typeof(Script.SymbolRemoteValue))]
[JsonSerializable(typeof(Script.ArrayRemoteValue))]
[JsonSerializable(typeof(Script.ObjectRemoteValue))]
[JsonSerializable(typeof(Script.FunctionRemoteValue))]
[JsonSerializable(typeof(Script.RegExpRemoteValue))]
[JsonSerializable(typeof(Script.DateRemoteValue))]
[JsonSerializable(typeof(Script.MapRemoteValue))]
[JsonSerializable(typeof(Script.SetRemoteValue))]
[JsonSerializable(typeof(Script.WeakMapRemoteValue))]
[JsonSerializable(typeof(Script.WeakSetRemoteValue))]
[JsonSerializable(typeof(Script.GeneratorRemoteValue))]
[JsonSerializable(typeof(Script.ErrorRemoteValue))]
[JsonSerializable(typeof(Script.ProxyRemoteValue))]
[JsonSerializable(typeof(Script.PromiseRemoteValue))]
[JsonSerializable(typeof(Script.TypedArrayRemoteValue))]
[JsonSerializable(typeof(Script.ArrayBufferRemoteValue))]
[JsonSerializable(typeof(Script.NodeListRemoteValue))]
[JsonSerializable(typeof(Script.HtmlCollectionRemoteValue))]
[JsonSerializable(typeof(Script.NodeRemoteValue))]
[JsonSerializable(typeof(Script.WindowProxyRemoteValue))]

[JsonSerializable(typeof(Script.WindowRealmInfo))]
[JsonSerializable(typeof(Script.DedicatedWorkerRealmInfo))]
[JsonSerializable(typeof(Script.SharedWorkerRealmInfo))]
[JsonSerializable(typeof(Script.ServiceWorkerRealmInfo))]
[JsonSerializable(typeof(Script.WorkerRealmInfo))]
[JsonSerializable(typeof(Script.PaintWorkletRealmInfo))]
[JsonSerializable(typeof(Script.AudioWorkletRealmInfo))]
[JsonSerializable(typeof(Script.WorkletRealmInfo))]

[JsonSerializable(typeof(Log.GenericLogEntry))]
[JsonSerializable(typeof(Log.ConsoleLogEntry))]
[JsonSerializable(typeof(Log.JavascriptLogEntry))]
#endregion

[JsonSerializable(typeof(Command))]
[JsonSerializable(typeof(EmptyResult))]

[JsonSerializable(typeof(Session.StatusCommand))]
[JsonSerializable(typeof(Session.StatusResult))]
[JsonSerializable(typeof(Session.NewCommand))]
[JsonSerializable(typeof(Session.NewResult))]
[JsonSerializable(typeof(Session.EndCommand))]
[JsonSerializable(typeof(Session.SubscribeCommand))]
[JsonSerializable(typeof(Session.SubscribeResult))]
[JsonSerializable(typeof(Session.UnsubscribeByIdCommand))]
[JsonSerializable(typeof(Session.UnsubscribeByAttributesCommand))]

[JsonSerializable(typeof(Browser.CloseCommand), TypeInfoPropertyName = "Browser_CloseCommand")]
[JsonSerializable(typeof(Browser.CreateUserContextCommand))]
[JsonSerializable(typeof(Browser.GetUserContextsCommand))]
[JsonSerializable(typeof(Browser.GetUserContextsResult))]
[JsonSerializable(typeof(Browser.RemoveUserContextCommand))]
[JsonSerializable(typeof(Browser.GetClientWindowsCommand))]
[JsonSerializable(typeof(Browser.GetClientWindowsResult))]
[JsonSerializable(typeof(Browser.UserContextInfo))]
[JsonSerializable(typeof(IReadOnlyList<Browser.UserContextInfo>))]
[JsonSerializable(typeof(IReadOnlyList<Browser.ClientWindowInfo>))]


[JsonSerializable(typeof(BrowsingContext.ActivateCommand))]
[JsonSerializable(typeof(BrowsingContext.CaptureScreenshotCommand))]
[JsonSerializable(typeof(BrowsingContext.CaptureScreenshotResult))]
[JsonSerializable(typeof(BrowsingContext.CloseCommand), TypeInfoPropertyName = "BrowsingContext_CloseCommand")]
[JsonSerializable(typeof(BrowsingContext.CreateCommand))]
[JsonSerializable(typeof(BrowsingContext.CreateResult))]
[JsonSerializable(typeof(BrowsingContext.GetTreeCommand))]
[JsonSerializable(typeof(BrowsingContext.GetTreeResult))]
[JsonSerializable(typeof(BrowsingContext.HandleUserPromptCommand))]
[JsonSerializable(typeof(BrowsingContext.LocateNodesCommand))]
[JsonSerializable(typeof(BrowsingContext.LocateNodesResult))]
[JsonSerializable(typeof(BrowsingContext.NavigateCommand))]
[JsonSerializable(typeof(BrowsingContext.NavigateResult))]
[JsonSerializable(typeof(BrowsingContext.PrintCommand))]
[JsonSerializable(typeof(BrowsingContext.PrintResult))]
[JsonSerializable(typeof(BrowsingContext.ReloadCommand))]
[JsonSerializable(typeof(BrowsingContext.SetViewportCommand))]
[JsonSerializable(typeof(BrowsingContext.TraverseHistoryCommand))]
[JsonSerializable(typeof(BrowsingContext.TraverseHistoryResult))]

[JsonSerializable(typeof(BrowsingContext.BrowsingContextInfo))]
[JsonSerializable(typeof(BrowsingContext.HistoryUpdatedEventArgs))]
[JsonSerializable(typeof(BrowsingContext.NavigationInfo))]
[JsonSerializable(typeof(BrowsingContext.UserPromptOpenedEventArgs))]
[JsonSerializable(typeof(BrowsingContext.UserPromptClosedEventArgs))]

[JsonSerializable(typeof(Network.AddInterceptCommand))]
[JsonSerializable(typeof(Network.AddInterceptResult))]
[JsonSerializable(typeof(Network.ContinueRequestCommand))]
[JsonSerializable(typeof(Network.ContinueResponseCommand))]
[JsonSerializable(typeof(Network.ContinueWithAuthCommand))]
[JsonSerializable(typeof(Network.FailRequestCommand))]
[JsonSerializable(typeof(Network.ProvideResponseCommand))]
[JsonSerializable(typeof(Network.RemoveInterceptCommand))]
[JsonSerializable(typeof(Network.SetCacheBehaviorCommand))]

[JsonSerializable(typeof(Network.BeforeRequestSentEventArgs))]
[JsonSerializable(typeof(Network.ResponseStartedEventArgs))]
[JsonSerializable(typeof(Network.ResponseCompletedEventArgs))]
[JsonSerializable(typeof(Network.FetchErrorEventArgs))]
[JsonSerializable(typeof(Network.AuthRequiredEventArgs))]

[JsonSerializable(typeof(Script.AddPreloadScriptCommand))]
[JsonSerializable(typeof(Script.AddPreloadScriptResult))]
[JsonSerializable(typeof(Script.DisownCommand))]
[JsonSerializable(typeof(Script.CallFunctionCommand))]
[JsonSerializable(typeof(Script.EvaluateCommand))]
[JsonSerializable(typeof(Script.EvaluateResult))]
[JsonSerializable(typeof(Script.GetRealmsCommand))]
[JsonSerializable(typeof(Script.GetRealmsResult))]
[JsonSerializable(typeof(Script.RemovePreloadScriptCommand))]

[JsonSerializable(typeof(Script.MessageEventArgs))]
[JsonSerializable(typeof(Script.RealmDestroyedEventArgs))]
[JsonSerializable(typeof(IReadOnlyList<Script.RealmInfo>))]

[JsonSerializable(typeof(Log.LogEntry))]

[JsonSerializable(typeof(Storage.GetCookiesCommand))]
[JsonSerializable(typeof(Storage.GetCookiesResult))]
[JsonSerializable(typeof(Storage.SetCookieCommand))]
[JsonSerializable(typeof(Storage.SetCookieResult))]
[JsonSerializable(typeof(Storage.DeleteCookiesCommand))]
[JsonSerializable(typeof(Storage.DeleteCookiesResult))]

[JsonSerializable(typeof(Input.PerformActionsCommand))]
[JsonSerializable(typeof(Input.ReleaseActionsCommand))]
[JsonSerializable(typeof(Input.SetFilesCommand))]
[JsonSerializable(typeof(IEnumerable<Input.IPointerSourceAction>))]
[JsonSerializable(typeof(IEnumerable<Input.IKeySourceAction>))]
[JsonSerializable(typeof(IEnumerable<Input.INoneSourceAction>))]
[JsonSerializable(typeof(IEnumerable<Input.IWheelSourceAction>))]

internal partial class BiDiJsonSerializerContext : JsonSerializerContext;
