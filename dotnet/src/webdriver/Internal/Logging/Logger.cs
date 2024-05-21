// <copyright file="Logger.cs" company="WebDriver Committers">
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
    /// The implementation of the <see cref="ILogger"/> interface through which log messages are emitted.
    /// </summary>
    /// <inheritdoc cref="ILogger"/>
    internal class Logger : ILogger
    {
        public Logger(Type issuer, LogEventLevel level)
        {
            Issuer = issuer;
            Level = level;
        }

        public LogEventLevel Level { get; set; }

        public Type Issuer { get; internal set; }

        public void Trace(string message)
        {
            LogMessage(LogEventLevel.Trace, message);
        }

        public void Debug(string message)
        {
            LogMessage(LogEventLevel.Debug, message);
        }

        public void Info(string message)
        {
            LogMessage(LogEventLevel.Info, message);
        }

        public void Warn(string message)
        {
            LogMessage(LogEventLevel.Warn, message);
        }

        public void Error(string message)
        {
            LogMessage(LogEventLevel.Error, message);
        }

        public bool IsEnabled(LogEventLevel level)
        {
            return Log.CurrentContext.IsEnabled(this, level);
        }

        private void LogMessage(LogEventLevel level, string message)
        {
            Log.CurrentContext.EmitMessage(this, level, message);
        }
    }
}
