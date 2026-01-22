// <copyright file="LogModule.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Json.Converters;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Log;

public sealed class LogModule : Module
{
    private LogJsonSerializerContext _jsonContext = null!;

    public async Task<Subscription> OnEntryAddedAsync(Func<LogEntry, Task> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("log.entryAdded", handler, options, _jsonContext.LogEntry).ConfigureAwait(false);
    }

    public async Task<Subscription> OnEntryAddedAsync(Action<LogEntry> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("log.entryAdded", handler, options, _jsonContext.LogEntry).ConfigureAwait(false);
    }

    protected override void Initialize(JsonSerializerOptions jsonSerializerOptions)
    {
        jsonSerializerOptions.Converters.Add(new BrowsingContextConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new RealmConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new InternalIdConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new HandleConverter(BiDi));

        _jsonContext = new LogJsonSerializerContext(jsonSerializerOptions);
    }
}

#region https://github.com/dotnet/runtime/issues/72604 Script.RemoteValue type dependency
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
#endregion

#region https://github.com/dotnet/runtime/issues/72604
[JsonSerializable(typeof(GenericLogEntry))]
[JsonSerializable(typeof(ConsoleLogEntry))]
[JsonSerializable(typeof(JavascriptLogEntry))]
#endregion

[JsonSerializable(typeof(LogEntry))]

internal partial class LogJsonSerializerContext : JsonSerializerContext;
