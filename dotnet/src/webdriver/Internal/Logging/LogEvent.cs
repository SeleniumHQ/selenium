// <copyright file="LogEvent.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;

namespace OpenQA.Selenium.Internal.Logging
{
    /// <summary>
    /// Represents a log event in the Selenium WebDriver internal logging system.
    /// </summary>
    public sealed class LogEvent
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="LogEvent"/> class.
        /// </summary>
        /// <param name="issuedBy">The type that issued the log event.</param>
        /// <param name="timestamp">The timestamp of the log event.</param>
        /// <param name="level">The level of the log event.</param>
        /// <param name="message">The message of the log event.</param>
        public LogEvent(Type issuedBy, DateTimeOffset timestamp, LogEventLevel level, string message)
        {
            IssuedBy = issuedBy;
            Timestamp = timestamp;
            Level = level;
            Message = message;
        }

        /// <summary>
        /// Gets the type that issued the log event.
        /// </summary>
        public Type IssuedBy { get; }

        /// <summary>
        /// Gets the timestamp of the log event.
        /// </summary>
        public DateTimeOffset Timestamp { get; }

        /// <summary>
        /// Gets the level of the log event.
        /// </summary>
        public LogEventLevel Level { get; }

        /// <summary>
        /// Gets the message of the log event.
        /// </summary>
        public string Message { get; }
    }
}
