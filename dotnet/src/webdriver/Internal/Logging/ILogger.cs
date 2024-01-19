// <copyright file="ILogger.cs" company="WebDriver Committers">
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
    /// Defines the interface through which log messages are emitted.
    /// </summary>
    internal interface ILogger
    {
        /// <summary>
        /// Writes a trace-level log message.
        /// </summary>
        /// <param name="message">The log message.</param>
        void Trace(string message);

        /// <summary>
        /// Writes a debug-level log message.
        /// </summary>
        /// <param name="message">The log message.</param>
        void Debug(string message);

        /// <summary>
        /// Writes an info-level log message.
        /// </summary>
        /// <param name="message">The log message.</param>
        void Info(string message);

        /// <summary>
        /// Writes a warning-level log message.
        /// </summary>
        /// <param name="message">The log message.</param>
        void Warn(string message);

        /// <summary>
        /// Writes an error-level log message.
        /// </summary>
        /// <param name="message">The log message.</param>
        void Error(string message);

        /// <summary>
        /// Gets or sets the log event level.
        /// </summary>
        LogEventLevel Level { get; set; }

        /// <summary>
        /// Gets the type of the logger issuer.
        /// </summary>
        Type Issuer { get; }

        /// <summary>
        /// Checks whether logs emitting is enabled for this logger and a log event level.
        /// </summary>
        /// <param name="level">The specified log event level to be checked.</param>
        /// <returns><c>true</c> if log messages emmiting is enabled for the specified log event level, otherwise <c>false</c>.</returns>
        bool IsEnabled(LogEventLevel level);
    }
}
