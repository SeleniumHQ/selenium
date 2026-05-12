// <copyright file="ScriptEvent.cs" company="Selenium Committers">
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

using static OpenQA.Selenium.BiDi.Script.ScriptJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.Script;

public static class ScriptEvent
{
    public static EventDescriptor<MessageEventArgs> Message { get; } = EventDescriptor<MessageEventArgs>.Create<MessageParameters>(
        "script.message",
        static (bidi, p) => new MessageEventArgs(bidi, p.Channel, p.Data, p.Source),
        Default.MessageParameters);

    public static EventDescriptor<RealmCreatedEventArgs> RealmCreated { get; } = EventDescriptor<RealmCreatedEventArgs>.Create<RealmInfo>(
        "script.realmCreated",
        static (bidi, p) => p switch
        {
            WindowRealmInfo w => new WindowRealmCreatedEventArgs(bidi, w.Realm, w.Origin, w.Context, w.UserContext, w.Sandbox),
            DedicatedWorkerRealmInfo d => new DedicatedWorkerRealmCreatedEventArgs(bidi, d.Realm, d.Origin, d.Owners),
            SharedWorkerRealmInfo s => new SharedWorkerRealmCreatedEventArgs(bidi, s.Realm, s.Origin),
            ServiceWorkerRealmInfo s => new ServiceWorkerRealmCreatedEventArgs(bidi, s.Realm, s.Origin),
            WorkerRealmInfo w => new WorkerRealmCreatedEventArgs(bidi, w.Realm, w.Origin),
            PaintWorkletRealmInfo p2 => new PaintWorkletRealmCreatedEventArgs(bidi, p2.Realm, p2.Origin),
            AudioWorkletRealmInfo a => new AudioWorkletRealmCreatedEventArgs(bidi, a.Realm, a.Origin),
            WorkletRealmInfo w => new WorkletRealmCreatedEventArgs(bidi, w.Realm, w.Origin),
            _ => throw new BiDiException($"Unknown {nameof(RealmInfo)} type: {p.GetType()}")
        },
        Default.RealmInfo);

    public static EventDescriptor<RealmDestroyedEventArgs> RealmDestroyed { get; } = EventDescriptor<RealmDestroyedEventArgs>.Create<RealmDestroyedParameters>(
        "script.realmDestroyed",
        static (bidi, p) => new RealmDestroyedEventArgs(bidi, p.Realm),
        Default.RealmDestroyedParameters);
}
