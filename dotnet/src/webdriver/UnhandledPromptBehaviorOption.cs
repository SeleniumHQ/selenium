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

namespace OpenQA.Selenium;

public abstract record UnhandledPromptBehaviorOption
{
    public static implicit operator UnhandledPromptBehaviorOption(UnhandledPromptBehavior value)
        => Single(value);

    public static UnhandledPromptBehaviorOption Single(UnhandledPromptBehavior value)
        => new UnhandledPromptBehaviorSingleOption(value);

    public static UnhandledPromptBehaviorOption Multi()
        => new UnhandledPromptBehaviorMultiOption();
}

public sealed record UnhandledPromptBehaviorSingleOption(UnhandledPromptBehavior Value) : UnhandledPromptBehaviorOption;

public sealed record UnhandledPromptBehaviorMultiOption : UnhandledPromptBehaviorOption
{
    public UnhandledPromptBehavior Alert { get; set; } = UnhandledPromptBehavior.Default;

    public UnhandledPromptBehavior Confirm { get; set; } = UnhandledPromptBehavior.Default;

    public UnhandledPromptBehavior Prompt { get; set; } = UnhandledPromptBehavior.Default;

    public UnhandledPromptBehavior BeforeUnload { get; set; } = UnhandledPromptBehavior.Default;

    public UnhandledPromptBehavior Default { get; set; } = UnhandledPromptBehavior.Default;
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
