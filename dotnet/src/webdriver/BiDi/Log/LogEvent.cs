// <copyright file="LogEvent.cs" company="Selenium Committers">
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

using static OpenQA.Selenium.BiDi.Log.LogJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.Log;

public static class LogEvent
{
    public static EventDescriptor<EntryAddedEventArgs> EntryAdded { get; } = EventDescriptor<EntryAddedEventArgs>.Create<LogEntry>(
        "log.entryAdded",
        static (bidi, p) => p switch
        {
            ConsoleLogEntry c => new ConsoleEntryAddedEventArgs(bidi, c.Level, c.Source, c.Text, c.Timestamp, c.Method, c.Args) { StackTrace = c.StackTrace },
            JavascriptLogEntry j => new JavascriptEntryAddedEventArgs(bidi, j.Level, j.Source, j.Text, j.Timestamp) { StackTrace = j.StackTrace },
            GenericLogEntry g => new GenericEntryAddedEventArgs(bidi, g.Type, g.Level, g.Source, g.Text, g.Timestamp) { StackTrace = g.StackTrace },
            _ => throw new BiDiException($"Unknown {nameof(LogEntry)} type: {p.GetType()}")
        },
        Default.LogEntry);
}
