// <copyright file="RealmInfoEventArgs.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Script;

public abstract record RealmCreatedEventArgs(Realm Realm, string Origin) : EventArgs;

public sealed record WindowRealmCreatedEventArgs(Realm Realm, string Origin, BrowsingContext.BrowsingContext Context, Browser.UserContext? UserContext, string? Sandbox) : RealmCreatedEventArgs(Realm, Origin);

public sealed record DedicatedWorkerRealmCreatedEventArgs(Realm Realm, string Origin, IReadOnlyList<Realm> Owners) : RealmCreatedEventArgs(Realm, Origin);

public sealed record SharedWorkerRealmCreatedEventArgs(Realm Realm, string Origin) : RealmCreatedEventArgs(Realm, Origin);

public sealed record ServiceWorkerRealmCreatedEventArgs(Realm Realm, string Origin) : RealmCreatedEventArgs(Realm, Origin);

public sealed record WorkerRealmCreatedEventArgs(Realm Realm, string Origin) : RealmCreatedEventArgs(Realm, Origin);

public sealed record PaintWorkletRealmCreatedEventArgs(Realm Realm, string Origin) : RealmCreatedEventArgs(Realm, Origin);

public sealed record AudioWorkletRealmCreatedEventArgs(Realm Realm, string Origin) : RealmCreatedEventArgs(Realm, Origin);

public sealed record WorkletRealmCreatedEventArgs(Realm Realm, string Origin) : RealmCreatedEventArgs(Realm, Origin);
