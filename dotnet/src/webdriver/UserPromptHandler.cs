// <copyright file="UserPromptHandler.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium;

/// <summary>
/// Represents a WebDriver session's user prompt handler, which defines how unhandled browser prompts
/// (alerts, confirms, prompts, beforeunload dialogs, file selection dialogs) are managed during automation.
/// </summary>
/// <remarks>
/// This corresponds to the W3C WebDriver <c>unhandledPromptBehavior</c> capability, which may be expressed
/// either as a single string applied to all prompt types, or as a per-prompt-type map.
/// <para>
/// Available variants:
/// <list type="bullet">
/// <item><description><see cref="Uniform"/> - Wraps a single <see cref="UnhandledPromptBehavior"/> value applied to all prompt types. Create via the implicit conversion from <see cref="UnhandledPromptBehavior"/> or by constructing <see cref="Uniform"/> directly.</description></item>
/// <item><description><see cref="PerPromptType"/> - Allows configuring per-prompt behaviors (Alert, Confirm, Prompt, BeforeUnload, File, Default).</description></item>
/// </list>
/// </para>
/// </remarks>
public abstract record UserPromptHandler
{
    private UserPromptHandler() { }

    /// <summary>
    /// Converts a nullable <see cref="UnhandledPromptBehavior"/> to a <see cref="UserPromptHandler"/> instance,
    /// or <see langword="null"/> when <paramref name="value"/> is <see langword="null"/>.
    /// </summary>
    /// <param name="value">The <see cref="UnhandledPromptBehavior"/> value to convert.</param>
    public static implicit operator UserPromptHandler?(UnhandledPromptBehavior? value)
        => value is { } v ? new Uniform(v) : null;

    internal abstract object? ToCapabilities();

    private static string ConvertBehaviorToString(UnhandledPromptBehavior behavior) =>
        behavior switch
        {
            UnhandledPromptBehavior.Ignore => "ignore",
            UnhandledPromptBehavior.Accept => "accept",
            UnhandledPromptBehavior.Dismiss => "dismiss",
            UnhandledPromptBehavior.AcceptAndNotify => "accept and notify",
            UnhandledPromptBehavior.DismissAndNotify => "dismiss and notify",
            _ => throw new InvalidOperationException($"UnhandledPromptBehavior value '{behavior}' is not recognized."),
        };

    /// <summary>
    /// Represents a user prompt handler that applies a single <see cref="UnhandledPromptBehavior"/> value
    /// as the fallback default for all prompt types.
    /// </summary>
    /// <param name="Value">The unhandled prompt behavior to apply. Specifies how unexpected browser prompts are handled during automation.</param>
    public sealed record Uniform(UnhandledPromptBehavior Value) : UserPromptHandler
    {
        internal override object? ToCapabilities()
        {
#pragma warning disable CS0618 // UnhandledPromptBehavior.Default is obsolete
            if (Value == UnhandledPromptBehavior.Default)
            {
                return null;
            }
#pragma warning restore CS0618

            return ConvertBehaviorToString(Value);
        }
    }

    /// <summary>
    /// Represents a user prompt handler that specifies distinct <see cref="UnhandledPromptBehavior"/> values
    /// for individual prompt types (alert, confirm, prompt, beforeunload, file), with a fallback default.
    /// </summary>
    /// <remarks>Use this variant to configure distinct behaviors for alert, confirm, prompt, beforeunload, and file
    /// selection dialogs encountered during browser automation. Each property allows you to control the response to a
    /// specific type of unhandled prompt, enabling fine-grained handling beyond a single global setting.</remarks>
    public sealed record PerPromptType : UserPromptHandler
    {
        /// <summary>
        /// Gets the behavior to use when an unexpected alert is encountered during automation,
        /// or <see langword="null"/> to leave it unset.
        /// </summary>
        public UnhandledPromptBehavior? Alert { get; init; }

        /// <summary>
        /// Gets the behavior to use when a confirmation prompt is encountered,
        /// or <see langword="null"/> to leave it unset.
        /// </summary>
        public UnhandledPromptBehavior? Confirm { get; init; }

        /// <summary>
        /// Gets the behavior to use when an unexpected prompt is encountered during automation,
        /// or <see langword="null"/> to leave it unset.
        /// </summary>
        public UnhandledPromptBehavior? Prompt { get; init; }

        /// <summary>
        /// Gets the behavior to use when an unexpected beforeunload dialog is encountered,
        /// or <see langword="null"/> to leave it unset.
        /// </summary>
        public UnhandledPromptBehavior? BeforeUnload { get; init; }

        /// <summary>
        /// Gets the behavior to use when an unexpected file selection dialog is encountered,
        /// or <see langword="null"/> to leave it unset.
        /// </summary>
        /// <remarks>The "file" prompt type is respected only in WebDriver BiDi sessions.</remarks>
        public UnhandledPromptBehavior? File { get; init; }

        /// <summary>
        /// Gets the fallback behavior to use when no specific handler is defined for a given prompt type,
        /// or <see langword="null"/> to leave it unset.
        /// </summary>
        public UnhandledPromptBehavior? Default { get; init; }

        internal override object? ToCapabilities()
        {
            Dictionary<string, string> capabilities = [];
            AddIfSet(capabilities, "alert", Alert);
            AddIfSet(capabilities, "confirm", Confirm);
            AddIfSet(capabilities, "prompt", Prompt);
            AddIfSet(capabilities, "beforeUnload", BeforeUnload);
            AddIfSet(capabilities, "file", File);
            AddIfSet(capabilities, "default", Default);
            return capabilities;
        }

        private static void AddIfSet(Dictionary<string, string> capabilities, string key, UnhandledPromptBehavior? value)
        {
#pragma warning disable CS0618 // UnhandledPromptBehavior.Default is obsolete
            if (value is { } v && v != UnhandledPromptBehavior.Default)
            {
                capabilities[key] = ConvertBehaviorToString(v);
            }
#pragma warning restore CS0618
        }
    }
}

/// <summary>
/// Specifies how a WebDriver session handles an unhandled user prompt.
/// </summary>
/// <remarks>
/// Corresponds to the handler values defined for the W3C WebDriver
/// <c>unhandledPromptBehavior</c> capability:
/// <c>dismiss</c>, <c>accept</c>, <c>dismiss and notify</c>, <c>accept and notify</c>, and <c>ignore</c>.
/// When no handler is configured, the spec's implicit default is <see cref="DismissAndNotify"/>.
/// </remarks>
public enum UnhandledPromptBehavior
{
    /// <summary>
    /// Sentinel value meaning "behavior not set". Not part of the W3C WebDriver spec.
    /// </summary>
    [Obsolete("Use a nullable UnhandledPromptBehavior? and pass null to leave the behavior unset. This member will be removed in v4.46.")]
    Default,

    /// <summary>
    /// Ignore unexpected alerts, such that the user must handle them.
    /// </summary>
    Ignore,

    /// <summary>
    /// Accept unexpected alerts.
    /// </summary>
    Accept,

    /// <summary>
    /// Dismiss unexpected alerts.
    /// </summary>
    Dismiss,

    /// <summary>
    /// Accepts unexpected alerts and notifies the user that the alert has
    /// been accepted by throwing an <see cref="UnhandledAlertException"/>
    /// </summary>
    AcceptAndNotify,

    /// <summary>
    /// Dismisses unexpected alerts and notifies the user that the alert has
    /// been dismissed by throwing an <see cref="UnhandledAlertException"/>
    /// </summary>
    DismissAndNotify
}
