// <copyright file="Logger.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.Internal.Logging;

/// <summary>
/// The implementation of the <see cref="ILogger"/> interface through which log messages are emitted.
/// </summary>
/// <inheritdoc cref="ILogger"/>
internal sealed class Logger : ILogger
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
        if (IsEnabled(LogEventLevel.Trace))
        {
            LogMessage(LogEventLevel.Trace, message);
        }
    }

    public void Trace(ref TraceLogStringHandler handler)
    {
        LogMessage(LogEventLevel.Trace, handler.ToStringAndClear());
    }

    public void Debug(string message)
    {
        if (IsEnabled(LogEventLevel.Debug))
        {
            LogMessage(LogEventLevel.Debug, message);
        }
    }

    public void Debug(ref DebugLogStringHandler handler)
    {
        LogMessage(LogEventLevel.Debug, handler.ToStringAndClear());
    }

    public void Info(string message)
    {
        if (IsEnabled(LogEventLevel.Info))
        {
            LogMessage(LogEventLevel.Info, message);
        }
    }

    public void Info(ref InfoLogStringHandler handler)
    {
        LogMessage(LogEventLevel.Info, handler.ToStringAndClear());
    }

    public void Warn(string message)
    {
        if (IsEnabled(LogEventLevel.Warn))
        {
            LogMessage(LogEventLevel.Warn, message);
        }
    }

    public void Warn(ref WarnLogStringHandler handler)
    {
        LogMessage(LogEventLevel.Warn, handler.ToStringAndClear());
    }

    public void Error(string message)
    {
        if (IsEnabled(LogEventLevel.Error))
        {
            LogMessage(LogEventLevel.Error, message);
        }
    }

    public void Error(ref ErrorLogStringHandler handler)
    {
        LogMessage(LogEventLevel.Error, handler.ToStringAndClear());
    }

    public bool IsEnabled(LogEventLevel level)
    {
        return Log.CurrentContext.IsEnabled(this, level);
    }

    public void LogMessage(DateTimeOffset timestamp, LogEventLevel level, string message)
    {
        Log.CurrentContext.EmitMessage(this, timestamp.ToLocalTime(), level, message);
    }

    private void LogMessage(LogEventLevel level, string message)
    {
        LogMessage(DateTimeOffset.Now, level, message);
    }
}
