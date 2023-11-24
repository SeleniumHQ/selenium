// <copyright file="DevToolsSessionLogMessageEventArgs.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// The level of the log data emitted.
    /// </summary>
    public enum DevToolsSessionLogLevel
    {
        /// <summary>
        /// Log at the trace level.
        /// </summary>
        Trace,

        /// <summary>
        /// Log at the error level.
        /// </summary>
        Error
    }

    /// <summary>
    /// Represents the data used when the DevToolsSession object emits log data.
    /// </summary>
    public class DevToolsSessionLogMessageEventArgs : EventArgs
    {
        /// <summary>
        /// Initializes a new instance of the DevToolsSessionLogMessageEventArgs class.
        /// </summary>
        /// <param name="level">The level of the log message.</param>
        /// <param name="message">The content of the log message.</param>
        /// <param name="args">Arguments to be substituted when the message is formatted.</param>
        public DevToolsSessionLogMessageEventArgs(DevToolsSessionLogLevel level, string message, params object[] args)
        {
            Level = level;
            Message = string.Format(message, args);
        }

        /// <summary>
        /// Gets the message content.
        /// </summary>
        public string Message { get; }

        /// <summary>
        /// Gets the message log level.
        /// </summary>
        public DevToolsSessionLogLevel Level { get; }
    }
}
