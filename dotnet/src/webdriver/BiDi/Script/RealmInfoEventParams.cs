// <copyright file="RealmInfoEventParams.cs" company="Selenium Committers">
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
using OpenQA.Selenium.BiDi.Json.Converters.Polymorphic;

namespace OpenQA.Selenium.BiDi.Script;

// https://github.com/dotnet/runtime/issues/72604
// [JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
// [JsonDerivedType(typeof(WindowRealmInfoEventParams), "window")]
// [JsonDerivedType(typeof(DedicatedWorkerRealmInfoEventParams), "dedicated-worker")]
// [JsonDerivedType(typeof(SharedWorkerRealmInfoEventParams), "shared-worker")]
// [JsonDerivedType(typeof(ServiceWorkerRealmInfoEventParams), "service-worker")]
// [JsonDerivedType(typeof(WorkerRealmInfoEventParams), "worker")]
// [JsonDerivedType(typeof(PaintWorkletRealmInfoEventParams), "paint-worklet")]
// [JsonDerivedType(typeof(AudioWorkletRealmInfoEventParams), "audio-worklet")]
// [JsonDerivedType(typeof(WorkletRealmInfoEventParams), "worklet")]
[JsonConverter(typeof(RealmInfoEventParamsConverter))]
public abstract record RealmInfoEventParams(Realm Realm, string Origin) : EventParams;

public sealed record WindowRealmInfoEventParams(Realm Realm, string Origin, BrowsingContext.BrowsingContext Context, Browser.UserContext? UserContext, string? Sandbox) : RealmInfoEventParams(Realm, Origin);

public sealed record DedicatedWorkerRealmInfoEventParams(Realm Realm, string Origin, IReadOnlyList<Realm> Owners) : RealmInfoEventParams(Realm, Origin);

public sealed record SharedWorkerRealmInfoEventParams(Realm Realm, string Origin) : RealmInfoEventParams(Realm, Origin);

public sealed record ServiceWorkerRealmInfoEventParams(Realm Realm, string Origin) : RealmInfoEventParams(Realm, Origin);

public sealed record WorkerRealmInfoEventParams(Realm Realm, string Origin) : RealmInfoEventParams(Realm, Origin);

public sealed record PaintWorkletRealmInfoEventParams(Realm Realm, string Origin) : RealmInfoEventParams(Realm, Origin);

public sealed record AudioWorkletRealmInfoEventParams(Realm Realm, string Origin) : RealmInfoEventParams(Realm, Origin);

public sealed record WorkletRealmInfoEventParams(Realm Realm, string Origin) : RealmInfoEventParams(Realm, Origin);
