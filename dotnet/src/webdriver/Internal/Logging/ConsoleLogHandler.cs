// <copyright file="ConsoleLogHandler.cs" company="WebDriver Committers">
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
using System.Collections.Generic;

namespace OpenQA.Selenium.Internal.Logging
{
    /// <summary>
    /// Represents a log handler that writes log events to the console.
    /// </summary>
    public class ConsoleLogHandler : ILogHandler
    {
        private static readonly Dictionary<LogEventLevel, string> _levelMap = new Dictionary<LogEventLevel, string>
        {
            { LogEventLevel.Trace, "TRC" },
            { LogEventLevel.Debug, "DBG" },
            { LogEventLevel.Info, "INF" },
            { LogEventLevel.Warn, "WRN" },
            { LogEventLevel.Error, "ERR" }
        };

        /// <summary>
        /// Handles a log event by writing it to the console.
        /// </summary>
        /// <param name="logEvent">The log event to handle.</param>
        public void Handle(LogEvent logEvent)
        {
            Console.WriteLine($"{logEvent.Timestamp:HH:mm:ss.fff} {_levelMap[logEvent.Level]} {logEvent.IssuedBy.Name}: {logEvent.Message}");
        }

        /// <summary>
        /// Creates a new instance of the <see cref="ConsoleLogHandler"/> class.
        /// </summary>
        /// <returns>A new instance of the <see cref="ConsoleLogHandler"/> class.</returns>
        public ILogHandler Clone()
        {
            return this;
        }
    }
}
