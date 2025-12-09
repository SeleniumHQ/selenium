// <copyright file="UnhandledPromptBehaviorOption.cs" company="Selenium Committers">
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
using System.Collections.Generic;

namespace OpenQA.Selenium;

/// <summary>
/// Represents a configuration option that determines how unhandled prompts are managed during automated browser
/// interactions.
/// </summary>
/// <remarks>
/// Use this type to specify whether a single unhandled prompt behavior or multiple behaviors should be applied.
/// The static methods provide convenient ways to create either a single-behavior or multi-behavior option.
/// This abstraction is typically used in scenarios where browser automation frameworks need to control the handling of
/// unexpected dialogs or prompts.
/// <para>
/// Available options:
/// <list type="bullet">
/// <item><description><see cref="UnhandledPromptBehaviorSingleOption"/> - Wraps a single <see cref="UnhandledPromptBehavior"/> value applied to all prompt types. Create via the implicit conversion from <see cref="UnhandledPromptBehavior"/> or by calling <see cref="Single(UnhandledPromptBehavior)"/>.</description></item>
/// <item><description><see cref="UnhandledPromptBehaviorMultiOption"/> - Allows configuring per-prompt behaviors (Alert, Confirm, Prompt, BeforeUnload, Default). Create via <see cref="Multi()"/>.</description></item>
/// </list>
/// </para>
/// </remarks>
public abstract record UnhandledPromptBehaviorOption
{
    /// <summary>
    /// Converts a value of type <see cref="UnhandledPromptBehavior"/> to an <see cref="UnhandledPromptBehaviorOption"/> instance.
    /// </summary>
    /// <param name="value">The <see cref="UnhandledPromptBehavior"/> value to convert.</param>
    public static implicit operator UnhandledPromptBehaviorOption(UnhandledPromptBehavior value)
        => Single(value);

    /// <summary>
    /// Creates an <see cref="UnhandledPromptBehaviorSingleOption"/> representing a single <see cref="UnhandledPromptBehavior"/> value.
    /// </summary>
    /// <param name="value">The <see cref="UnhandledPromptBehavior"/> to apply for all prompt types.</param>
    /// <returns>An <see cref="UnhandledPromptBehaviorSingleOption"/> wrapping the provided behavior.</returns>
    public static UnhandledPromptBehaviorSingleOption Single(UnhandledPromptBehavior value)
        => new(value);

    /// <summary>
    /// Creates an <see cref="UnhandledPromptBehaviorMultiOption"/> allowing individual <see cref="UnhandledPromptBehavior"/> values per prompt type.
    /// </summary>
    /// <returns>An <see cref="UnhandledPromptBehaviorMultiOption"/> with per-prompt configurable behaviors.</returns>
    public static UnhandledPromptBehaviorMultiOption Multi()
        => new();

    internal abstract object? ToCapabilities();

    internal static string ConvertBehaviorToString(UnhandledPromptBehavior behavior) =>
        behavior switch
        {
            UnhandledPromptBehavior.Ignore => "ignore",
            UnhandledPromptBehavior.Accept => "accept",
            UnhandledPromptBehavior.Dismiss => "dismiss",
            UnhandledPromptBehavior.AcceptAndNotify => "accept and notify",
            UnhandledPromptBehavior.DismissAndNotify => "dismiss and notify",
            _ => throw new ArgumentOutOfRangeException(nameof(behavior), $"UnhandledPromptBehavior value '{behavior}' is not recognized."),
        };
}

/// <summary>
/// Represents an option that specifies a single unhandled prompt behavior to use when interacting with browser dialogs.
/// </summary>
/// <param name="Value">The unhandled prompt behavior to apply. Specifies how unexpected browser prompts are handled during automation.</param>
public sealed record UnhandledPromptBehaviorSingleOption(UnhandledPromptBehavior Value) : UnhandledPromptBehaviorOption
{
    internal override object? ToCapabilities()
    {
        if (Value == UnhandledPromptBehavior.Default)
        {
            return null;
        }

        return ConvertBehaviorToString(Value);
    }
}

/// <summary>
/// Represents a set of options that specify how unhandled browser prompts are handled for different prompt types.
/// </summary>
/// <remarks>Use this class to configure distinct behaviors for alert, confirm, prompt, and beforeunload dialogs
/// encountered during browser automation. Each property allows you to control the response to a specific type of
/// unhandled prompt, enabling fine-grained handling beyond a single global setting.</remarks>
public sealed record UnhandledPromptBehaviorMultiOption : UnhandledPromptBehaviorOption
{
    /// <summary>
    /// Gets or sets the behavior to use when an unexpected alert is encountered during automation.
    /// </summary>
    public UnhandledPromptBehavior Alert { get; set; } = UnhandledPromptBehavior.Default;

    /// <summary>
    /// Gets or sets the behavior to use when a confirmation prompt is encountered.
    /// </summary>
    /// <remarks>Set this property to specify how the system should respond to confirmation dialogs, such as
    /// JavaScript confirm boxes, during automated operations. The default value is <see
    /// cref="UnhandledPromptBehavior.Default"/>, which applies the standard handling defined by the
    /// environment.</remarks>
    public UnhandledPromptBehavior Confirm { get; set; } = UnhandledPromptBehavior.Default;

    /// <summary>
    /// Gets or sets the behavior to use when an unexpected prompt is encountered during automation.
    /// </summary>
    /// <remarks>Set this property to control how the system responds to unhandled prompts, such as alerts or
    /// confirmation dialogs, that appear unexpectedly. The default behavior is determined by the value of
    /// <see cref="UnhandledPromptBehavior.Default"/>.</remarks>
    public UnhandledPromptBehavior Prompt { get; set; } = UnhandledPromptBehavior.Default;

    /// <summary>
    /// Gets or sets the behavior to use when an unexpected beforeunload dialog is encountered.
    /// </summary>
    /// <remarks>Use this property to specify how the application should respond to beforeunload dialogs that
    /// appear unexpectedly during automated browser interactions. This setting determines whether such dialogs are
    /// automatically accepted, dismissed, or cause an error.</remarks>
    public UnhandledPromptBehavior BeforeUnload { get; set; } = UnhandledPromptBehavior.Default;

    /// <summary>
    /// Gets or sets the default behavior to use when an unexpected browser prompt is encountered.
    /// </summary>
    public UnhandledPromptBehavior Default { get; set; } = UnhandledPromptBehavior.Default;

    internal override object? ToCapabilities()
    {
        if (this == new UnhandledPromptBehaviorMultiOption())
        {
            return null;
        }

        Dictionary<string, string> capabilities = [];

        if (Alert != default)
        {
            capabilities["alert"] = ConvertBehaviorToString(Alert);
        }

        if (Confirm != default)
        {
            capabilities["confirm"] = ConvertBehaviorToString(Confirm);
        }

        if (Prompt != default)
        {
            capabilities["prompt"] = ConvertBehaviorToString(Prompt);
        }

        if (BeforeUnload != default)
        {
            capabilities["beforeUnload"] = ConvertBehaviorToString(BeforeUnload);
        }

        if (Default != default)
        {
            capabilities["default"] = ConvertBehaviorToString(Default);
        }

        return capabilities;
    }
}

/// <summary>
/// Specifies the behavior of handling unexpected alerts in the IE driver.
/// </summary>
public enum UnhandledPromptBehavior
{
    /// <summary>
    /// Indicates the behavior is not set.
    /// </summary>
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
