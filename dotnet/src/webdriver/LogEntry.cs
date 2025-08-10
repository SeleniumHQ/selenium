// <copyright file="LogEntry.cs" company="Selenium Committers">
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

using System;
using System.Collections.Generic;
using System.Globalization;

namespace OpenQA.Selenium;

/// <summary>
/// Represents an entry in a log from a driver instance.
/// </summary>
public class LogEntry
{

    /// <summary>
    /// Initializes a new instance of the <see cref="LogEntry"/> class.
    /// </summary>
    private LogEntry()
    {
    }

    /// <summary>
    /// Gets the timestamp value of the log entry.
    /// </summary>
    public DateTime Timestamp { get; private set; } = DateTime.MinValue;

    /// <summary>
    /// Gets the logging level of the log entry.
    /// </summary>
    public LogLevel Level { get; private set; } = LogLevel.All;

    /// <summary>
    /// Gets the message of the log entry.
    /// </summary>
    public string Message { get; private set; } = string.Empty;

    private static readonly DateTime UnixEpoch = new(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    /// <summary>
    /// Returns a string that represents the current <see cref="LogEntry"/>.
    /// </summary>
    /// <returns>A string that represents the current <see cref="LogEntry"/>.</returns>
    public override string ToString()
    {
        return string.Format(CultureInfo.InvariantCulture, "[{0:yyyy-MM-ddTHH:mm:ssZ}] [{1}] {2}", this.Timestamp, this.Level, this.Message);
    }

    /// <summary>
    /// Creates a <see cref="LogEntry"/> from a dictionary as deserialized from JSON.
    /// </summary>
    /// <param name="entryDictionary">The <see cref="Dictionary{TKey, TValue}"/> from
    /// which to create the <see cref="LogEntry"/>.</param>
    /// <returns>A <see cref="LogEntry"/> with the values in the dictionary.</returns>
    internal static LogEntry FromDictionary(Dictionary<string, object?> entryDictionary)
    {
        LogEntry entry = new LogEntry();
        if (entryDictionary.TryGetValue("message", out object? message))
        {
            entry.Message = message?.ToString() ?? string.Empty;
        }

        if (entryDictionary.TryGetValue("timestamp", out object? timestamp))
        {
            double timestampValue = Convert.ToDouble(timestamp, CultureInfo.InvariantCulture);
            entry.Timestamp = UnixEpoch.AddMilliseconds(timestampValue);
        }

        if (entryDictionary.TryGetValue("level", out object? level))
        {
            if (Enum.TryParse(level?.ToString(), ignoreCase: true, out LogLevel result))
            {
                entry.Level = result;
            }
            else
            {
                // If the requested log level string is not a valid log level,
                // ignore it and use LogLevel.All.
                entry.Level = LogLevel.All;
            }
        }

        return entry;
    }
}
