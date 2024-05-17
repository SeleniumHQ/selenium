// <copyright file="Log.cs" company="WebDriver Committers">
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
    /// Provides context aware logging functionality for the Selenium WebDriver.
    /// </summary>
    /// 
    /// <remarks>
    /// Use the following code to enable logging to console:
    /// <code>
    /// Log.SetMinimumLevel(LogEventLevel.Debug)).WithHandler(new ConsoleLogHandler());
    /// </code>
    ///
    /// Or enable it per limited execution scope:
    /// <code>
    /// using (var ctx = Log.CreateContext(LogEventLevel.Trace))
    /// {
    ///   // do something
    /// }
    /// </code>
    /// </remarks>
    public static class Log
    {
        private static readonly LogContextManager _logContextManager = new LogContextManager();

        /// <summary>
        /// Creates a new log context with the current context properties and the specified minimum log event level.
        /// </summary>
        /// <returns>The created log context.</returns>
        public static ILogContext CreateContext()
        {
            return _logContextManager.CurrentContext.CreateContext();
        }

        /// <summary>
        /// Creates a new log context with with the current context properties and the specified minimum log event level.
        /// </summary>
        /// <param name="minimumLevel">The minimum log event level.</param>
        /// <returns>The created log context.</returns>
        public static ILogContext CreateContext(LogEventLevel minimumLevel)
        {
            return _logContextManager.CurrentContext.CreateContext(minimumLevel);
        }

        /// <summary>
        /// Gets or sets the current log context.
        /// </summary>
        internal static ILogContext CurrentContext
        {
            get
            {
                return _logContextManager.CurrentContext;
            }
            set
            {
                _logContextManager.CurrentContext = value;
            }
        }

        /// <summary>
        /// Gets a logger for the specified type.
        /// </summary>
        /// <typeparam name="T">The type to get the logger for.</typeparam>
        /// <returns>The logger.</returns>
        internal static ILogger GetLogger<T>()
        {
            return _logContextManager.CurrentContext.GetLogger<T>();
        }

        /// <summary>
        /// Gets a logger for the specified type.
        /// </summary>
        /// <param name="type">The type to get the logger for.</param>
        /// <returns>The logger.</returns>
        internal static ILogger GetLogger(Type type)
        {
            return _logContextManager.CurrentContext.GetLogger(type);
        }

        /// <summary>
        /// Sets the minimum log event level for the current log context.
        /// </summary>
        /// <param name="level">The minimum log event level.</param>
        /// <returns>The current log context.</returns>
        public static ILogContext SetLevel(LogEventLevel level)
        {
            return _logContextManager.CurrentContext.SetLevel(level);
        }

        /// <summary>
        /// Sets the minimum log event level for the specified issuer in the current log context.
        /// </summary>
        /// <param name="issuer">The issuer type.</param>
        /// <param name="level">The minimum log event level.</param>
        /// <returns>The current log context.</returns>
        public static ILogContext SetLevel(Type issuer, LogEventLevel level)
        {
            return _logContextManager.CurrentContext.SetLevel(issuer, level);
        }

        /// <summary>
        /// Gets a list of log handlers for the current log context.
        /// </summary>
        public static ILogHandlerList Handlers => _logContextManager.CurrentContext.Handlers;
    }
}
