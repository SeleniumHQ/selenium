// <copyright file="ILogContext.cs" company="WebDriver Committers">
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
    /// Represents a logging context that provides methods for creating sub-contexts, retrieving loggers, emitting log messages, and configuring minimum log levels.
    /// </summary>
    public interface ILogContext : IDisposable
    {
        /// <summary>
        /// Creates a new logging context.
        /// </summary>
        /// <returns>A new instance of <see cref="ILogContext"/>.</returns>
        ILogContext CreateContext();

        /// <summary>
        /// Creates a new logging context with the specified minimum log level.
        /// </summary>
        /// <param name="minimumLevel">The minimum log level for the new context.</param>
        /// <returns>A new instance of <see cref="ILogContext"/> with the specified minimum log level.</returns>
        ILogContext CreateContext(LogEventLevel minimumLevel);

        /// <summary>
        /// Gets a logger for the specified type.
        /// </summary>
        /// <typeparam name="T">The type for which to retrieve the logger.</typeparam>
        /// <returns>An instance of <see cref="ILogger"/> for the specified type.</returns>
        internal ILogger GetLogger<T>();

        /// <summary>
        /// Gets a logger for the specified type.
        /// </summary>
        /// <param name="type">The type for which to retrieve the logger.</param>
        /// <returns>An instance of <see cref="ILogger"/> for the specified type.</returns>
        internal ILogger GetLogger(Type type);

        /// <summary>
        /// Checks whether logs emitting is enabled for a logger and a log event level.
        /// </summary>
        /// <param name="logger">The specified logger instance to be checked.</param>
        /// <param name="level">The specified log event level to be checked.</param>
        /// <returns><c>true</c> if log messages emmiting is enabled for the specified logger and log event level, otherwise <c>false</c>.</returns>
        internal bool IsEnabled(ILogger logger, LogEventLevel level);

        /// <summary>
        /// Emits a log message using the specified logger, log level, and message.
        /// </summary>
        /// <param name="logger">The logger to emit the log message.</param>
        /// <param name="level">The log level of the message.</param>
        /// <param name="message">The log message.</param>
        internal void EmitMessage(ILogger logger, LogEventLevel level, string message);

        /// <summary>
        /// Sets the minimum log level for the current context.
        /// </summary>
        /// <param name="level">The minimum log level.</param>
        /// <returns>The current instance of <see cref="ILogContext"/> with the minimum log level set.</returns>
        ILogContext SetLevel(LogEventLevel level);

        /// <summary>
        /// Sets the minimum log level for the specified type in the current context.
        /// </summary>
        /// <param name="issuer">The type for which to set the minimum log level.</param>
        /// <param name="level">The minimum log level.</param>
        /// <returns>The current instance of <see cref="ILogContext"/> with the minimum log level set for the specified type.</returns>
        ILogContext SetLevel(Type issuer, LogEventLevel level);

        /// <summary>
        /// Gets a list of log handlers.
        /// </summary>
        ILogHandlerList Handlers { get; }
    }
}
