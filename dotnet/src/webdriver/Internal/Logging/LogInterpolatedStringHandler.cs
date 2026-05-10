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

using System.Globalization;
using System.Runtime.CompilerServices;
#if !NET8_0_OR_GREATER
using System.Text;
#endif

namespace OpenQA.Selenium.Internal.Logging;

/// <summary>
/// Interpolated string handler for <see cref="LogEventLevel.Trace"/> log messages.
/// Defers string construction until the log level is confirmed enabled.
/// </summary>
[InterpolatedStringHandler]
public ref struct TraceLogStringHandler
{
    // Not readonly: AppendLiteral/AppendFormatted on LogInterpolatedStringHandler mutate the embedded
    // DefaultInterpolatedStringHandler value (position counter); a readonly field would be defensively copied.
#pragma warning disable IDE0044 // Add readonly modifier
    private LogInterpolatedStringHandler _inner;
#pragma warning restore IDE0044

    /// <summary>
    /// Initializes a new instance of the <see cref="TraceLogStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="isEnabled">On return, indicates whether logging is enabled for this level.</param>
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
public ref struct DebugLogStringHandler
{
#pragma warning disable IDE0044 // Add readonly modifier - see TraceLogStringHandler for rationale
    private LogInterpolatedStringHandler _inner;
#pragma warning restore IDE0044

    /// <summary>
    /// Initializes a new instance of the <see cref="DebugLogStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="isEnabled">On return, indicates whether logging is enabled for this level.</param>
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
public ref struct InfoLogStringHandler
{
#pragma warning disable IDE0044 // Add readonly modifier - see TraceLogStringHandler for rationale
    private LogInterpolatedStringHandler _inner;
#pragma warning restore IDE0044

    /// <summary>
    /// Initializes a new instance of the <see cref="InfoLogStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="isEnabled">On return, indicates whether logging is enabled for this level.</param>
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
public ref struct WarnLogStringHandler
{
#pragma warning disable IDE0044 // Add readonly modifier - see TraceLogStringHandler for rationale
    private LogInterpolatedStringHandler _inner;
#pragma warning restore IDE0044

    /// <summary>
    /// Initializes a new instance of the <see cref="WarnLogStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="isEnabled">On return, indicates whether logging is enabled for this level.</param>
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
public ref struct ErrorLogStringHandler
{
#pragma warning disable IDE0044 // Add readonly modifier - see TraceLogStringHandler for rationale
    private LogInterpolatedStringHandler _inner;
#pragma warning restore IDE0044

    /// <summary>
    /// Initializes a new instance of the <see cref="ErrorLogStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="isEnabled">On return, indicates whether logging is enabled for this level.</param>
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
/// <remarks>
/// On <c>net8.0</c> and later this delegates to <c>System.Runtime.CompilerServices.DefaultInterpolatedStringHandler</c>,
/// which uses pooled character buffers and <c>ISpanFormattable</c> to avoid boxing of value-type arguments.
/// On older target frameworks a <c>System.Text.StringBuilder</c> is used. All formatting is performed using
/// <see cref="CultureInfo.InvariantCulture"/> so log output is culture-independent.
/// </remarks>
[InterpolatedStringHandler]
public ref struct LogInterpolatedStringHandler
{
#if NET8_0_OR_GREATER
    private DefaultInterpolatedStringHandler _handler;
    private readonly bool _enabled;
#else
    private readonly StringBuilder? _builder;
#endif

    /// <summary>
    /// Initializes a new instance of the <see cref="LogInterpolatedStringHandler"/> struct.
    /// </summary>
    /// <param name="literalLength">The number of literal characters in the interpolated string.</param>
    /// <param name="formattedCount">The number of interpolation holes in the interpolated string.</param>
    /// <param name="logger">The logger to check for enabled status.</param>
    /// <param name="level">The log event level to check.</param>
    /// <param name="isEnabled">On return, indicates whether logging is enabled for this level.</param>
    public LogInterpolatedStringHandler(int literalLength, int formattedCount, ILogger logger, LogEventLevel level, out bool isEnabled)
    {
        isEnabled = logger.IsEnabled(level);

#if NET8_0_OR_GREATER
        _enabled = isEnabled;
        _handler = isEnabled
            ? new DefaultInterpolatedStringHandler(literalLength, formattedCount, CultureInfo.InvariantCulture)
            : default;
#else
        if (isEnabled)
        {
            _builder = new StringBuilder(literalLength);
        }
#endif
    }

    /// <summary>
    /// Appends a literal string to the handler.
    /// </summary>
    /// <param name="s">The literal string to append.</param>
    public void AppendLiteral(string s)
    {
#if NET8_0_OR_GREATER
        if (_enabled)
        {
            _handler.AppendLiteral(s);
        }
#else
        _builder?.Append(s);
#endif
    }

    /// <summary>
    /// Appends a formatted value to the handler.
    /// </summary>
    /// <typeparam name="T">The type of the value to format.</typeparam>
    /// <param name="value">The value to format and append.</param>
    public void AppendFormatted<T>(T value)
    {
#if NET8_0_OR_GREATER
        if (_enabled)
        {
            _handler.AppendFormatted(value);
        }
#else
        if (_builder is null)
        {
            return;
        }

        if (value is IFormattable formattable)
        {
            _builder.Append(formattable.ToString(format: null, CultureInfo.InvariantCulture));
        }
        else if (value is not null)
        {
            _builder.Append(value.ToString());
        }
#endif
    }

    /// <summary>
    /// Appends a formatted value with a format string to the handler.
    /// </summary>
    /// <typeparam name="T">The type of the value to format.</typeparam>
    /// <param name="value">The value to format and append.</param>
    /// <param name="format">The format string.</param>
    public void AppendFormatted<T>(T value, string? format)
    {
#if NET8_0_OR_GREATER
        if (_enabled)
        {
            _handler.AppendFormatted(value, format);
        }
#else
        if (_builder is null)
        {
            return;
        }

        if (value is IFormattable formattable)
        {
            _builder.Append(formattable.ToString(format, CultureInfo.InvariantCulture));
        }
        else if (value is not null)
        {
            _builder.Append(value.ToString());
        }
#endif
    }

    /// <summary>
    /// Appends a formatted value with alignment to the handler.
    /// </summary>
    /// <typeparam name="T">The type of the value to format.</typeparam>
    /// <param name="value">The value to format and append.</param>
    /// <param name="alignment">The alignment for the formatted value.</param>
    public void AppendFormatted<T>(T value, int alignment)
    {
        AppendFormatted(value, alignment, format: null);
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
#if NET8_0_OR_GREATER
        if (_enabled)
        {
            _handler.AppendFormatted(value, alignment, format);
        }
#else
        if (_builder is null)
        {
            return;
        }

        string text;
        if (value is IFormattable formattable)
        {
            text = formattable.ToString(format, CultureInfo.InvariantCulture);
        }
        else
        {
            text = value?.ToString() ?? string.Empty;
        }

        int padding = Math.Abs(alignment) - text.Length;
        if (padding <= 0)
        {
            _builder.Append(text);
        }
        else if (alignment < 0)
        {
            _builder.Append(text).Append(' ', padding);
        }
        else
        {
            _builder.Append(' ', padding).Append(text);
        }
#endif
    }

    internal string ToStringAndClear()
    {
#if NET8_0_OR_GREATER
        return _enabled ? _handler.ToStringAndClear() : string.Empty;
#else
        return _builder?.ToString() ?? string.Empty;
#endif
    }
}
