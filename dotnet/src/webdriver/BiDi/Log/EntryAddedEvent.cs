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

public abstract record EntryAddedEventArgs(
    IBiDi BiDi,
    Level Level,
    Script.Source Source,
    string? Text,
    DateTimeOffset Timestamp)
    : EventArgs(BiDi)
{
    public Script.StackTrace? StackTrace { get; init; }
}

public sealed record GenericEntryAddedEventArgs(
    IBiDi BiDi,
    string Type,
    Level Level,
    Script.Source Source,
    string? Text,
    DateTimeOffset Timestamp)
    : EntryAddedEventArgs(BiDi, Level, Source, Text, Timestamp);

public sealed record ConsoleEntryAddedEventArgs(
    IBiDi BiDi,
    Level Level,
    Script.Source Source,
    string? Text,
    DateTimeOffset Timestamp,
    string Method,
    IReadOnlyList<Script.RemoteValue> Args)
    : EntryAddedEventArgs(BiDi, Level, Source, Text, Timestamp);

public sealed record JavascriptEntryAddedEventArgs(
    IBiDi BiDi,
    Level Level,
    Script.Source Source,
    string? Text,
    DateTimeOffset Timestamp)
    : EntryAddedEventArgs(BiDi, Level, Source, Text, Timestamp);

[JsonConverter(typeof(CamelCaseEnumConverter<Level>))]
public enum Level
{
    Debug,
    Info,
    Warn,
    Error
}

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
//[JsonDerivedType(typeof(GenericLogEntry))]
//[JsonDerivedType(typeof(ConsoleLogEntry), "console")]
//[JsonDerivedType(typeof(JavascriptLogEntry), "javascript")]
[JsonConverter(typeof(LogEntryConverter))]
internal abstract record LogEntry(
    Level Level,
    Script.Source Source,
    string? Text,
    [property: JsonConverter(typeof(DateTimeOffsetConverter))] DateTimeOffset Timestamp)
{
    public Script.StackTrace? StackTrace { get; init; }
}

internal sealed record GenericLogEntry(
    string Type,
    Level Level,
    Script.Source Source,
    string? Text,
    DateTimeOffset Timestamp)
    : LogEntry(Level, Source, Text, Timestamp);

internal sealed record ConsoleLogEntry(
    Level Level,
    Script.Source Source,
    string? Text,
    DateTimeOffset Timestamp,
    string Method,
    IReadOnlyList<Script.RemoteValue> Args)
    : LogEntry(Level, Source, Text, Timestamp);

internal sealed record JavascriptLogEntry(
    Level Level,
    Script.Source Source,
    string? Text,
    DateTimeOffset Timestamp)
    : LogEntry(Level, Source, Text, Timestamp);


// https://github.com/dotnet/runtime/issues/72604
internal class LogEntryConverter : JsonConverter<LogEntry>
{
    public override LogEntry? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.GetDiscriminator("type") switch
        {
            "console" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ConsoleLogEntry>()),
            "javascript" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<JavascriptLogEntry>()),
            _ => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<GenericLogEntry>()),
        };
    }

    public override void Write(Utf8JsonWriter writer, LogEntry value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
