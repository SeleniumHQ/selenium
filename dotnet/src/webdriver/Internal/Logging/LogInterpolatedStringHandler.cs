// <copyright file="LogInterpolatedStringHandler.cs" company="Selenium Committers">
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

using System.Runtime.CompilerServices;
using System.Text;

namespace OpenQA.Selenium.Internal.Logging;

/// <summary>
/// Interpolated string handler for <see cref="LogEventLevel.Trace"/> log messages.
/// Defers string construction until the log level is confirmed enabled.
/// </summary>
[InterpolatedStringHandler]
public readonly ref struct TraceLogStringHandler
{
    private readonly LogInterpolatedStringHandler _inner;

    /// <summary>
    /// Initializes a new instance of the <see cref="TraceLogStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="isEnabled">When this method returns, indicates whether the handler is enabled.</param>
    public TraceLogStringHandler(int literalLength, int formattedCount, ILogger logger, out bool isEnabled)
    {
        _inner = new LogInterpolatedStringHandler(literalLength, formattedCount, logger, LogEventLevel.Trace, out isEnabled);
    }

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendLiteral(string)"/>
    public void AppendLiteral(string s) => _inner.AppendLiteral(s);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T)"/>
    public void AppendFormatted<T>(T value) => _inner.AppendFormatted(value);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, string?)"/>
    public void AppendFormatted<T>(T value, string? format) => _inner.AppendFormatted(value, format);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, int)"/>
    public void AppendFormatted<T>(T value, int alignment) => _inner.AppendFormatted(value, alignment);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, int, string?)"/>
    public void AppendFormatted<T>(T value, int alignment, string? format) => _inner.AppendFormatted(value, alignment, format);

    internal string ToStringAndClear() => _inner.ToStringAndClear();
}

/// <summary>
/// Interpolated string handler for <see cref="LogEventLevel.Debug"/> log messages.
/// Defers string construction until the log level is confirmed enabled.
/// </summary>
[InterpolatedStringHandler]
public readonly ref struct DebugLogStringHandler
{
    private readonly LogInterpolatedStringHandler _inner;

    /// <summary>
    /// Initializes a new instance of the <see cref="DebugLogStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="isEnabled">When this method returns, indicates whether the handler is enabled.</param>
    public DebugLogStringHandler(int literalLength, int formattedCount, ILogger logger, out bool isEnabled)
    {
        _inner = new LogInterpolatedStringHandler(literalLength, formattedCount, logger, LogEventLevel.Debug, out isEnabled);
    }

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendLiteral(string)"/>
    public void AppendLiteral(string s) => _inner.AppendLiteral(s);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T)"/>
    public void AppendFormatted<T>(T value) => _inner.AppendFormatted(value);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, string?)"/>
    public void AppendFormatted<T>(T value, string? format) => _inner.AppendFormatted(value, format);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, int)"/>
    public void AppendFormatted<T>(T value, int alignment) => _inner.AppendFormatted(value, alignment);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, int, string?)"/>
    public void AppendFormatted<T>(T value, int alignment, string? format) => _inner.AppendFormatted(value, alignment, format);

    internal string ToStringAndClear() => _inner.ToStringAndClear();
}

/// <summary>
/// Interpolated string handler for <see cref="LogEventLevel.Info"/> log messages.
/// Defers string construction until the log level is confirmed enabled.
/// </summary>
[InterpolatedStringHandler]
public readonly ref struct InfoLogStringHandler
{
    private readonly LogInterpolatedStringHandler _inner;

    /// <summary>
    /// Initializes a new instance of the <see cref="InfoLogStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="isEnabled">When this method returns, indicates whether the handler is enabled.</param>
    public InfoLogStringHandler(int literalLength, int formattedCount, ILogger logger, out bool isEnabled)
    {
        _inner = new LogInterpolatedStringHandler(literalLength, formattedCount, logger, LogEventLevel.Info, out isEnabled);
    }

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendLiteral(string)"/>
    public void AppendLiteral(string s) => _inner.AppendLiteral(s);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T)"/>
    public void AppendFormatted<T>(T value) => _inner.AppendFormatted(value);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, string?)"/>
    public void AppendFormatted<T>(T value, string? format) => _inner.AppendFormatted(value, format);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, int)"/>
    public void AppendFormatted<T>(T value, int alignment) => _inner.AppendFormatted(value, alignment);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, int, string?)"/>
    public void AppendFormatted<T>(T value, int alignment, string? format) => _inner.AppendFormatted(value, alignment, format);

    internal string ToStringAndClear() => _inner.ToStringAndClear();
}

/// <summary>
/// Interpolated string handler for <see cref="LogEventLevel.Warn"/> log messages.
/// Defers string construction until the log level is confirmed enabled.
/// </summary>
[InterpolatedStringHandler]
public readonly ref struct WarnLogStringHandler
{
    private readonly LogInterpolatedStringHandler _inner;

    /// <summary>
    /// Initializes a new instance of the <see cref="WarnLogStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="isEnabled">When this method returns, indicates whether the handler is enabled.</param>
    public WarnLogStringHandler(int literalLength, int formattedCount, ILogger logger, out bool isEnabled)
    {
        _inner = new LogInterpolatedStringHandler(literalLength, formattedCount, logger, LogEventLevel.Warn, out isEnabled);
    }

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendLiteral(string)"/>
    public void AppendLiteral(string s) => _inner.AppendLiteral(s);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T)"/>
    public void AppendFormatted<T>(T value) => _inner.AppendFormatted(value);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, string?)"/>
    public void AppendFormatted<T>(T value, string? format) => _inner.AppendFormatted(value, format);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, int)"/>
    public void AppendFormatted<T>(T value, int alignment) => _inner.AppendFormatted(value, alignment);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, int, string?)"/>
    public void AppendFormatted<T>(T value, int alignment, string? format) => _inner.AppendFormatted(value, alignment, format);

    internal string ToStringAndClear() => _inner.ToStringAndClear();
}

/// <summary>
/// Interpolated string handler for <see cref="LogEventLevel.Error"/> log messages.
/// Defers string construction until the log level is confirmed enabled.
/// </summary>
[InterpolatedStringHandler]
public readonly ref struct ErrorLogStringHandler
{
    private readonly LogInterpolatedStringHandler _inner;

    /// <summary>
    /// Initializes a new instance of the <see cref="ErrorLogStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="isEnabled">When this method returns, indicates whether the handler is enabled.</param>
    public ErrorLogStringHandler(int literalLength, int formattedCount, ILogger logger, out bool isEnabled)
    {
        _inner = new LogInterpolatedStringHandler(literalLength, formattedCount, logger, LogEventLevel.Error, out isEnabled);
    }

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendLiteral(string)"/>
    public void AppendLiteral(string s) => _inner.AppendLiteral(s);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T)"/>
    public void AppendFormatted<T>(T value) => _inner.AppendFormatted(value);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, string?)"/>
    public void AppendFormatted<T>(T value, string? format) => _inner.AppendFormatted(value, format);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, int)"/>
    public void AppendFormatted<T>(T value, int alignment) => _inner.AppendFormatted(value, alignment);

    /// <inheritdoc cref="LogInterpolatedStringHandler.AppendFormatted{T}(T, int, string?)"/>
    public void AppendFormatted<T>(T value, int alignment, string? format) => _inner.AppendFormatted(value, alignment, format);

    internal string ToStringAndClear() => _inner.ToStringAndClear();
}

/// <summary>
/// Core interpolated string handler that defers string construction until the log level is confirmed enabled,
/// avoiding unnecessary string allocations when logging is disabled.
/// </summary>
[InterpolatedStringHandler]
public readonly ref struct LogInterpolatedStringHandler
{
    private readonly StringBuilder? _builder;

    /// <summary>
    /// Initializes a new instance of the <see cref="LogInterpolatedStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="level">The log event level to check.</param>
    /// <param name="isEnabled">When this method returns, indicates whether the handler is enabled.</param>
    public LogInterpolatedStringHandler(int literalLength, int formattedCount, ILogger logger, LogEventLevel level, out bool isEnabled)
    {
        isEnabled = logger.IsEnabled(level);

        if (isEnabled)
        {
            _builder = new StringBuilder(literalLength);
        }
    }

    /// <summary>
    /// Appends a literal string to the handler.
    /// </summary>
    /// <param name="s">The literal string to append.</param>
    public void AppendLiteral(string s)
    {
        _builder?.Append(s);
    }

    /// <summary>
    /// Appends a formatted value to the handler.
    /// </summary>
    /// <typeparam name="T">The type of the value to format.</typeparam>
    /// <param name="value">The value to format and append.</param>
    public void AppendFormatted<T>(T value)
    {
        _builder?.Append(value);
    }

    /// <summary>
    /// Appends a formatted value with a format string to the handler.
    /// </summary>
    /// <typeparam name="T">The type of the value to format.</typeparam>
    /// <param name="value">The value to format and append.</param>
    /// <param name="format">The format string.</param>
    public void AppendFormatted<T>(T value, string? format)
    {
        _builder?.AppendFormat($"{{0:{format}}}", value);
    }

    /// <summary>
    /// Appends a formatted value with alignment to the handler.
    /// </summary>
    /// <typeparam name="T">The type of the value to format.</typeparam>
    /// <param name="value">The value to format and append.</param>
    /// <param name="alignment">The alignment for the formatted value.</param>
    public void AppendFormatted<T>(T value, int alignment)
    {
        _builder?.AppendFormat($"{{0,{alignment}}}", value);
    }

    /// <summary>
    /// Appends a formatted value with alignment and a format string to the handler.
    /// </summary>
    /// <typeparam name="T">The type of the value to format.</typeparam>
    /// <param name="value">The value to format and append.</param>
    /// <param name="alignment">The alignment for the formatted value.</param>
    /// <param name="format">The format string.</param>
    public void AppendFormatted<T>(T value, int alignment, string? format)
    {
        _builder?.AppendFormat($"{{0,{alignment}:{format}}}", value);
    }

    internal string ToStringAndClear()
    {
        return _builder?.ToString() ?? string.Empty;
    }
}
