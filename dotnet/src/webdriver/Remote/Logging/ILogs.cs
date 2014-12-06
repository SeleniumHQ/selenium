// <copyright file="ILogs.cs" company="WebDriver Committers">
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

using System.Collections.Generic;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Contains the logs for a session divided by supported log types.
    /// </summary>
    public interface ILogs
    {
        /// <summary>
        /// Queries for available log types.
        /// </summary>
        /// <value>
        /// The available log types.
        /// </value>
        /// <returns>A list of available log types</returns>
        IEnumerable<LogTypeEnum> AvailableLogTypes { get; }

        /// <summary>
        /// Fetches available log entries for the given log type.
        /// </summary>
        /// <param name="logType">Type of the log.</param>
        /// <returns>Available log entries for the specified log type.</returns>
        IEnumerable<LogEntry> LogEntries(LogTypeEnum logType);
    }
}