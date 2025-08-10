// <copyright file="RealmInfo.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Script;

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
//[JsonDerivedType(typeof(WindowRealmInfo), "window")]
//[JsonDerivedType(typeof(DedicatedWorkerRealmInfo), "dedicated-worker")]
//[JsonDerivedType(typeof(SharedWorkerRealmInfo), "shared-worker")]
//[JsonDerivedType(typeof(ServiceWorkerRealmInfo), "service-worker")]
//[JsonDerivedType(typeof(WorkerRealmInfo), "worker")]
//[JsonDerivedType(typeof(PaintWorkletRealmInfo), "paint-worklet")]
//[JsonDerivedType(typeof(AudioWorkletRealmInfo), "audio-worklet")]
//[JsonDerivedType(typeof(WorkletRealmInfo), "worklet")]
public abstract record RealmInfo(BiDi BiDi, Realm Realm, string Origin) : EventArgs(BiDi);

public sealed record WindowRealmInfo(BiDi BiDi, Realm Realm, string Origin, BrowsingContext.BrowsingContext Context) : RealmInfo(BiDi, Realm, Origin)
{
    public string? Sandbox { get; set; }
}

public sealed record DedicatedWorkerRealmInfo(BiDi BiDi, Realm Realm, string Origin, IReadOnlyList<Realm> Owners) : RealmInfo(BiDi, Realm, Origin);

public sealed record SharedWorkerRealmInfo(BiDi BiDi, Realm Realm, string Origin) : RealmInfo(BiDi, Realm, Origin);

public sealed record ServiceWorkerRealmInfo(BiDi BiDi, Realm Realm, string Origin) : RealmInfo(BiDi, Realm, Origin);

public sealed record WorkerRealmInfo(BiDi BiDi, Realm Realm, string Origin) : RealmInfo(BiDi, Realm, Origin);

public sealed record PaintWorkletRealmInfo(BiDi BiDi, Realm Realm, string Origin) : RealmInfo(BiDi, Realm, Origin);

public sealed record AudioWorkletRealmInfo(BiDi BiDi, Realm Realm, string Origin) : RealmInfo(BiDi, Realm, Origin);

public sealed record WorkletRealmInfo(BiDi BiDi, Realm Realm, string Origin) : RealmInfo(BiDi, Realm, Origin);
