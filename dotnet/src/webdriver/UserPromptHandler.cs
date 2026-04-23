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
/// (alerts, confirms, prompts, beforeunload dialogs) are managed during automation.
/// </summary>
/// <remarks>
/// This corresponds to the W3C WebDriver <c>unhandledPromptBehavior</c> capability, which may be expressed
/// either as a single string applied to all prompt types, or as a per-prompt-type map.
/// <para>
/// Available variants:
/// <list type="bullet">
/// <item><description><see cref="Uniform"/> - Wraps a single <see cref="UnhandledPromptBehavior"/> value applied to all prompt types. Create via the implicit conversion from <see cref="UnhandledPromptBehavior"/> or by constructing <see cref="Uniform"/> directly.</description></item>
/// <item><description><see cref="PerPromptType"/> - Allows configuring per-prompt behaviors (Alert, Confirm, Prompt, BeforeUnload, Default).</description></item>
/// </list>
/// </para>
/// </remarks>
public abstract record UserPromptHandler
{
    private UserPromptHandler() { }

    /// <summary>
    /// Converts a value of type <see cref="UnhandledPromptBehavior"/> to a <see cref="UserPromptHandler"/> instance.
    /// </summary>
    /// <param name="value">The <see cref="UnhandledPromptBehavior"/> value to convert.</param>
    public static implicit operator UserPromptHandler(UnhandledPromptBehavior value)
        => new Uniform(value);

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
            if (Value == UnhandledPromptBehavior.Default)
            {
                return null;
            }

            return ConvertBehaviorToString(Value);
        }
    }

    /// <summary>
    /// Represents a user prompt handler that specifies distinct <see cref="UnhandledPromptBehavior"/> values
    /// for individual prompt types (alert, confirm, prompt, beforeunload), with a fallback default.
    /// </summary>
    /// <remarks>Use this variant to configure distinct behaviors for alert, confirm, prompt, and beforeunload dialogs
    /// encountered during browser automation. Each property allows you to control the response to a specific type of
    /// unhandled prompt, enabling fine-grained handling beyond a single global setting.</remarks>
    public sealed record PerPromptType : UserPromptHandler
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
        /// Gets or sets the behavior to use when an unexpected file selection dialog is encountered.
        /// </summary>
        /// <remarks>The "file" prompt type is respected only in WebDriver BiDi sessions.</remarks>
        public UnhandledPromptBehavior File { get; set; } = UnhandledPromptBehavior.Default;

        /// <summary>
        /// Gets or sets the default behavior to use when an unexpected browser prompt is encountered.
        /// </summary>
        public UnhandledPromptBehavior Default { get; set; } = UnhandledPromptBehavior.Default;

        internal override object? ToCapabilities()
        {
            if (this == new PerPromptType())
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

            if (File != default)
            {
                capabilities["file"] = ConvertBehaviorToString(File);
            }

            if (Default != default)
            {
                capabilities["default"] = ConvertBehaviorToString(Default);
            }

            return capabilities;
        }
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
