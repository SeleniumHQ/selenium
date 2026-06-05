// <copyright file="RealmInfoEvent.cs" company="Selenium Committers">
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

using System.Text.Json;
using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi.Json;

namespace OpenQA.Selenium.BiDi.Script;

[JsonConverter(typeof(RealmCreatedEventArgsConverter))]
public abstract record RealmCreatedEventArgs(
    Realm Realm,
    string Origin) : EventArgs;

public sealed record WindowRealmCreatedEventArgs(
    Realm Realm,
    string Origin,
    BrowsingContext.BrowsingContext Context,
    Browser.UserContext? UserContext,
    string? Sandbox) : RealmCreatedEventArgs(Realm, Origin);

public sealed record DedicatedWorkerRealmCreatedEventArgs(
    Realm Realm,
    string Origin,
    ImmutableArray<Realm> Owners) : RealmCreatedEventArgs(Realm, Origin);

public sealed record SharedWorkerRealmCreatedEventArgs(
    Realm Realm,
    string Origin) : RealmCreatedEventArgs(Realm, Origin);

public sealed record ServiceWorkerRealmCreatedEventArgs(
    Realm Realm,
    string Origin) : RealmCreatedEventArgs(Realm, Origin);

public sealed record WorkerRealmCreatedEventArgs(
    Realm Realm,
    string Origin) : RealmCreatedEventArgs(Realm, Origin);

public sealed record PaintWorkletRealmCreatedEventArgs(
    Realm Realm,
    string Origin) : RealmCreatedEventArgs(Realm, Origin);

public sealed record AudioWorkletRealmCreatedEventArgs(
    Realm Realm,
    string Origin) : RealmCreatedEventArgs(Realm, Origin);

public sealed record WorkletRealmCreatedEventArgs(
    Realm Realm,
    string Origin) : RealmCreatedEventArgs(Realm, Origin);

internal class RealmCreatedEventArgsConverter : JsonConverter<RealmCreatedEventArgs>
{
    public override RealmCreatedEventArgs? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var type = reader.GetDiscriminator("type");
        return type switch
        {
            "window" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<WindowRealmCreatedEventArgs>()),
            "dedicated-worker" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<DedicatedWorkerRealmCreatedEventArgs>()),
            "shared-worker" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<SharedWorkerRealmCreatedEventArgs>()),
            "service-worker" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ServiceWorkerRealmCreatedEventArgs>()),
            "worker" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<WorkerRealmCreatedEventArgs>()),
            "paint-worklet" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<PaintWorkletRealmCreatedEventArgs>()),
            "audio-worklet" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<AudioWorkletRealmCreatedEventArgs>()),
            "worklet" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<WorkletRealmCreatedEventArgs>()),
            _ => throw new BiDiException($"Unknown realm type '{type}'")
        };
    }

    public override void Write(Utf8JsonWriter writer, RealmCreatedEventArgs value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
