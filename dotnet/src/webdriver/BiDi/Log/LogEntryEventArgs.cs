// <copyright file="LogEntryEventArgs.cs" company="Selenium Committers">
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
using OpenQA.Selenium.BiDi.Json.Converters;
using OpenQA.Selenium.BiDi.Json.Converters.Polymorphic;

namespace OpenQA.Selenium.BiDi.Log;

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
//[JsonDerivedType(typeof(GenericLogEntryEventArgs))]
//[JsonDerivedType(typeof(ConsoleLogEntryEventArgs), "console")]
//[JsonDerivedType(typeof(JavascriptLogEntryEventArgs), "javascript")]
[JsonConverter(typeof(LogEntryEventArgsConverter))]
public abstract record LogEntryEventArgs(Level Level, Script.Source Source, string? Text, DateTimeOffset Timestamp)
    : EventArgs
{
    public Script.StackTrace? StackTrace { get; init; }
}

public sealed record GenericLogEntryEventArgs(string Type, Level Level, Script.Source Source, string? Text, DateTimeOffset Timestamp)
    : LogEntryEventArgs(Level, Source, Text, Timestamp);

public sealed record ConsoleLogEntryEventArgs(Level Level, Script.Source Source, string? Text, DateTimeOffset Timestamp, string Method, IReadOnlyList<Script.RemoteValue> Args)
    : LogEntryEventArgs(Level, Source, Text, Timestamp);

public sealed record JavascriptLogEntryEventArgs(Level Level, Script.Source Source, string? Text, DateTimeOffset Timestamp)
    : LogEntryEventArgs(Level, Source, Text, Timestamp);

[JsonConverter(typeof(CamelCaseEnumConverter<Level>))]
public enum Level
{
    Debug,
    Info,
    Warn,
    Error
}
