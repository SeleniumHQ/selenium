// <copyright file="EntryAddedEvent.cs" company="Selenium Committers">
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
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.Log;

[JsonConverter(typeof(EntryAddedEventArgsConverter))]
public abstract record EntryAddedEventArgs(
    Level Level,
    Script.Source Source,
    string? Text,
    [property: JsonConverter(typeof(DateTimeOffsetConverter))] DateTimeOffset Timestamp)
    : EventArgs
{
    public Script.StackTrace? StackTrace { get; init; }
}

public sealed record GenericEntryAddedEventArgs(
    string Type,
    Level Level,
    Script.Source Source,
    string? Text,
    DateTimeOffset Timestamp)
    : EntryAddedEventArgs(Level, Source, Text, Timestamp);

public sealed record ConsoleEntryAddedEventArgs(
    Level Level,
    Script.Source Source,
    string? Text,
    DateTimeOffset Timestamp,
    string Method,
    ImmutableArray<Script.RemoteValue> Args)
    : EntryAddedEventArgs(Level, Source, Text, Timestamp);

public sealed record JavascriptEntryAddedEventArgs(
    Level Level,
    Script.Source Source,
    string? Text,
    DateTimeOffset Timestamp)
    : EntryAddedEventArgs(Level, Source, Text, Timestamp);

[JsonConverter(typeof(CamelCaseEnumConverter<Level>))]
public enum Level
{
    Debug,
    Info,
    Warn,
    Error
}

internal class EntryAddedEventArgsConverter : JsonConverter<EntryAddedEventArgs>
{
    public override EntryAddedEventArgs? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.GetDiscriminator("type") switch
        {
            "console" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ConsoleEntryAddedEventArgs>()),
            "javascript" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<JavascriptEntryAddedEventArgs>()),
            _ => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<GenericEntryAddedEventArgs>()),
        };
    }

    public override void Write(Utf8JsonWriter writer, EntryAddedEventArgs value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
