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

using System;
using System.Runtime.CompilerServices;

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

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void Trace(string message)
    {
        LogMessage(LogEventLevel.Trace, message);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void Debug(string message)
    {
        LogMessage(LogEventLevel.Debug, message);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void Info(string message)
    {
        LogMessage(LogEventLevel.Info, message);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void Warn(string message)
    {
        LogMessage(LogEventLevel.Warn, message);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void Error(string message)
    {
        LogMessage(LogEventLevel.Error, message);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public bool IsEnabled(LogEventLevel level)
    {
        return Log.CurrentContext.IsEnabled(this, level);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private void LogMessage(LogEventLevel level, string message)
    {
        Log.CurrentContext.EmitMessage(this, level, message);
    }
}
