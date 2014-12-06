// <copyright file="LogEntry.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents a single log statement.
    /// </summary>
    public class LogEntry
    {
        internal LogEntry(Level level, string message, DateTime eventDateTime)
        {
            Level = level;
            Message = message;
            EventDateTime = eventDateTime;
        }

        /// <summary>
        /// Gets the logging entry's severity.
        /// </summary>
        /// <value>
        /// Severity of log statement
        /// </value>
        public Level Level { get; private set; }

        /// <summary>
        /// Gets the log entry's message.
        /// </summary>
        /// <value>
        /// The log statement
        /// </value>
        public string Message { get; private set; }

        /// <summary>
        /// Gets the UTC Time of the log statement.
        /// </summary>
        /// <value>
        /// UTC Time of Log Event
        /// </value>
        public DateTime EventDateTime { get; private set; }
    }
}