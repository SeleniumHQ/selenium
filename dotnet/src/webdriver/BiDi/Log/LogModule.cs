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

using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Log;

internal sealed class LogModule : Module, ILogModule
{
    public IEventSource<EntryAddedEventArgs> EntryAdded => _entryAdded ?? Interlocked.CompareExchange(ref _entryAdded, CreateEventSource(LogEvent.EntryAdded), null) ?? _entryAdded;
    private IEventSource<EntryAddedEventArgs>? _entryAdded;
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

[JsonSerializable(typeof(LogEntry))]
// https://github.com/dotnet/runtime/issues/72604
[JsonSerializable(typeof(GenericLogEntry))]
[JsonSerializable(typeof(ConsoleLogEntry))]
[JsonSerializable(typeof(JavascriptLogEntry))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class LogJsonSerializerContext : JsonSerializerContext;
