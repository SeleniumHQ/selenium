// <copyright file="DriverOptions.cs" company="Selenium Committers">
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

using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;

namespace OpenQA.Selenium;

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

/// <summary>
/// Specifies the behavior of waiting for page loads in the driver.
/// </summary>
public enum PageLoadStrategy
{
    /// <summary>
    /// Indicates the behavior is not set.
    /// </summary>
    Default,

    /// <summary>
    /// Waits for pages to load and ready state to be 'complete'.
    /// </summary>
    Normal,

    /// <summary>
    /// Waits for pages to load and for ready state to be 'interactive' or 'complete'.
    /// </summary>
    Eager,

    /// <summary>
    /// Does not wait for pages to load, returning immediately.
    /// </summary>
    None
}

internal class Timeout
{
    public TimeSpan? Script { get; set; }
    public TimeSpan? PageLoad { get; set; }
    public TimeSpan? ImplicitWait { get; set; }

    public Dictionary<string, object> ToCapabilities()
    {
        var timeoutCapabilities = new Dictionary<string, object>();

        if (Script.HasValue) timeoutCapabilities.Add("script", Script.Value.TotalMilliseconds);
        if (PageLoad.HasValue) timeoutCapabilities.Add("pageLoad", PageLoad.Value.TotalMilliseconds);
        if (ImplicitWait.HasValue) timeoutCapabilities.Add("implicit", ImplicitWait.Value.TotalMilliseconds);

        return timeoutCapabilities;
    }
}

/// <summary>
/// Base class for managing options specific to a browser driver.
/// </summary>
public abstract class DriverOptions
{
    private readonly Dictionary<string, object> additionalCapabilities = new Dictionary<string, object>();
    private readonly Dictionary<string, LogLevel> loggingPreferences = new Dictionary<string, LogLevel>();
    private readonly Dictionary<string, string> knownCapabilityNames = new Dictionary<string, string>();

    /// <summary>
    /// Initializes a new instance of the <see cref="DriverOptions"/> class.
    /// </summary>
    protected DriverOptions()
    {
        this.AddKnownCapabilityName(CapabilityType.BrowserName, "BrowserName property");
        this.AddKnownCapabilityName(CapabilityType.BrowserVersion, "BrowserVersion property");
        this.AddKnownCapabilityName(CapabilityType.PlatformName, "PlatformName property");
        this.AddKnownCapabilityName(CapabilityType.Proxy, "Proxy property");
        this.AddKnownCapabilityName(CapabilityType.UnhandledPromptBehavior, "UnhandledPromptBehavior property");
        this.AddKnownCapabilityName(CapabilityType.PageLoadStrategy, "PageLoadStrategy property");
        this.AddKnownCapabilityName(CapabilityType.UseStrictFileInteractability, "UseStrictFileInteractability property");
        this.AddKnownCapabilityName(CapabilityType.WebSocketUrl, "UseWebSocketUrl property");
        this.AddKnownCapabilityName(CapabilityType.EnableDownloads, "EnableDownloads property");
    }

    /// <summary>
    /// Gets or sets the name of the browser.
    /// </summary>
    public string? BrowserName { get; protected set; }

    /// <summary>
    /// Gets or sets the version of the browser.
    /// </summary>
    public string? BrowserVersion { get; set; }

    /// <summary>
    /// Gets or sets the name of the platform on which the browser is running.
    /// </summary>
    public string? PlatformName { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the browser should accept self-signed
    /// SSL certificates.
    /// </summary>
    public bool? AcceptInsecureCertificates { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the driver should request a URL to
    /// a WebSocket to be used for bidirectional communication.
    /// </summary>
    public bool? UseWebSocketUrl { get; set; }

    /// <summary>
    /// Gets or sets the value for describing how unexpected alerts are to be handled in the browser.
    /// Defaults to <see cref="UnhandledPromptBehavior.Default"/>.
    /// </summary>
    public UnhandledPromptBehavior UnhandledPromptBehavior { get; set; } = UnhandledPromptBehavior.Default;

    /// <summary>
    /// Gets or sets the value for describing how the browser is to wait for pages to load in the browser.
    /// Defaults to <see cref="PageLoadStrategy.Default"/>.
    /// </summary>
    public PageLoadStrategy PageLoadStrategy { get; set; } = PageLoadStrategy.Default;

    /// <summary>
    /// Gets or sets the <see cref="Proxy"/> to be used with this browser.
    /// </summary>
    public Proxy? Proxy { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether &lt;input type='file'/&gt; elements
    /// must be visible to allow uploading of files.
    /// </summary>
    public bool UseStrictFileInteractability { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether files may be downloaded from remote node.
    /// </summary>
    public bool? EnableDownloads { get; set; }

    /// <summary>
    /// Gets or sets the asynchronous script timeout, which is the amount
    /// of time the driver should wait when executing JavaScript asynchronously.
    /// This timeout only affects the <see cref="IJavaScriptExecutor.ExecuteAsyncScript(string, object[])"/>
    /// method.
    /// </summary>
    public TimeSpan? ScriptTimeout { get; set; }

    /// <summary>
    /// Gets or sets the page load timeout, which is the amount of time the driver
    /// should wait for a page to load when setting the <see cref="IWebDriver.Url"/>
    /// property.
    /// </summary>
    public TimeSpan? PageLoadTimeout { get; set; }

    /// <summary>
    /// Gets or sets the implicit wait timeout, which is the  amount of time the
    /// driver should wait when searching for an element if it is not immediately
    /// present.
    /// </summary>
    /// <remarks>
    /// When searching for a single element, the driver should poll the page
    /// until the element has been found, or this timeout expires before throwing
    /// a <see cref="NoSuchElementException"/>. When searching for multiple elements,
    /// the driver should poll the page until at least one element has been found
    /// or this timeout has expired.
    /// <para>
    /// Increasing the implicit wait timeout should be used judiciously as it
    /// will have an adverse effect on test run time, especially when used with
    /// slower location strategies like XPath.
    /// </para>
    /// </remarks>
    public TimeSpan? ImplicitWaitTimeout { get; set; }

    /// <summary>
    /// Set or Get the location of the browser
    /// Override in subclass
    /// </summary>
    public virtual string? BinaryLocation
    {
        get => null;
        set => throw new NotImplementedException();
    }

    /// <summary>
    /// Provides a means to add additional capabilities not yet added as type safe options
    /// for the specific browser driver.
    /// </summary>
    /// <param name="optionName">The name of the capability to add.</param>
    /// <param name="optionValue">The value of the capability to add.</param>
    /// <exception cref="ArgumentException">
    /// thrown when attempting to add a capability for which there is already a type safe option, or
    /// when <paramref name="optionName"/> is <see langword="null"/> or the empty string.
    /// </exception>
    /// <remarks>Calling <see cref="AddAdditionalOption(string, object)"/>
    /// where <paramref name="optionName"/> has already been added will overwrite the
    /// existing value with the new value in <paramref name="optionValue"/>.
    /// </remarks>
    public virtual void AddAdditionalOption(string optionName, object optionValue)
    {
        this.ValidateCapabilityName(optionName);
        this.additionalCapabilities[optionName] = optionValue;
    }

    /// <summary>
    /// Returns the <see cref="ICapabilities"/> for the specific browser driver with these
    /// options included as capabilities. This does not copy the options. Further
    /// changes will be reflected in the returned capabilities.
    /// </summary>
    /// <returns>The <see cref="ICapabilities"/> for browser driver with these options.</returns>
    public abstract ICapabilities ToCapabilities();

    /// <summary>
    /// Compares this <see cref="DriverOptions"/> object with another to see if there
    /// are merge conflicts between them.
    /// </summary>
    /// <param name="other">The <see cref="DriverOptions"/> object to compare with.</param>
    /// <returns>A <see cref="DriverOptionsMergeResult"/> object containing the status of the attempted merge.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="other"/> is <see langword="null"/>.</exception>
    public virtual DriverOptionsMergeResult GetMergeResult(DriverOptions other)
    {
        if (other is null)
        {
            throw new ArgumentNullException(nameof(other));
        }

        DriverOptionsMergeResult result = new DriverOptionsMergeResult();
        if (this.BrowserName != null && other.BrowserName != null)
        {
            result.IsMergeConflict = true;
            result.MergeConflictOptionName = "BrowserName";
            return result;
        }

        if (this.BrowserVersion != null && other.BrowserVersion != null)
        {
            result.IsMergeConflict = true;
            result.MergeConflictOptionName = "BrowserVersion";
            return result;
        }

        if (this.PlatformName != null && other.PlatformName != null)
        {
            result.IsMergeConflict = true;
            result.MergeConflictOptionName = "PlatformName";
            return result;
        }

        if (this.Proxy != null && other.Proxy != null)
        {
            result.IsMergeConflict = true;
            result.MergeConflictOptionName = "Proxy";
            return result;
        }

        if (this.UnhandledPromptBehavior != UnhandledPromptBehavior.Default && other.UnhandledPromptBehavior != UnhandledPromptBehavior.Default)
        {
            result.IsMergeConflict = true;
            result.MergeConflictOptionName = "UnhandledPromptBehavior";
            return result;
        }

        if (this.PageLoadStrategy != PageLoadStrategy.Default && other.PageLoadStrategy != PageLoadStrategy.Default)
        {
            result.IsMergeConflict = true;
            result.MergeConflictOptionName = "PageLoadStrategy";
            return result;
        }

        return result;
    }

    /// <summary>
    /// Sets the logging preferences for this driver.
    /// </summary>
    /// <param name="logType">The type of log for which to set the preference.
    /// Known log types can be found in the <see cref="LogType"/> class.</param>
    /// <param name="logLevel">The <see cref="LogLevel"/> value to which to set the log level.</param>
    public void SetLoggingPreference(string logType, LogLevel logLevel)
    {
        this.loggingPreferences[logType] = logLevel;
    }

    /// <summary>
    /// Returns the current options as a <see cref="Dictionary{TKey, TValue}"/>.
    /// </summary>
    /// <returns>The current options as a <see cref="Dictionary{TKey, TValue}"/>.</returns>
    internal IDictionary<string, object>? ToDictionary()
    {
        ICapabilities? capabilities = this.ToCapabilities();
        if (capabilities is not IHasCapabilitiesDictionary desired)
        {
            return null;
        }

        return desired.CapabilitiesDictionary;
    }

    /// <summary>
    /// Validates the name of the capability to verify it is not a capability
    /// for which a type-safe property or method already exists.
    /// </summary>
    /// <param name="capabilityName">The name of the capability to validate.</param>
    /// <exception cref="ArgumentException">
    /// thrown when attempting to add a capability for which there is already a type safe option, or
    /// when <paramref name="capabilityName"/> is <see langword="null"/> or the empty string.
    /// </exception>
    protected void ValidateCapabilityName([NotNull] string? capabilityName)
    {
        if (capabilityName is null || string.IsNullOrEmpty(capabilityName))
        {
            throw new ArgumentException("Capability name may not be null an empty string.", nameof(capabilityName));
        }

        if (this.TryGetKnownCapability(capabilityName!, out string? typeSafeOptionName))
        {
            string message = string.Format(CultureInfo.InvariantCulture, "There is already an option for the {0} capability. Please use the {1} instead.", capabilityName, typeSafeOptionName);
            throw new ArgumentException(message, nameof(capabilityName));
        }
    }

    /// <summary>
    /// Adds a known capability to the list of known capabilities and associates it
    /// with the type-safe property name of the options class to be used instead.
    /// </summary>
    /// <param name="capabilityName">The name of the capability.</param>
    /// <param name="typeSafeOptionName">The name of the option property or method to be used instead.</param>
    protected void AddKnownCapabilityName(string capabilityName, string typeSafeOptionName)
    {
        this.knownCapabilityNames[capabilityName] = typeSafeOptionName;
    }

    /// <summary>
    /// Remove a capability from the list of known capabilities
    /// </summary>
    /// <param name="capabilityName">The name of the capability to be removed.</param>
    protected void RemoveKnownCapabilityName(string? capabilityName)
    {
        if (capabilityName is not null)
        {
            this.knownCapabilityNames.Remove(capabilityName);
        }
    }

    /// <summary>
    /// Gets a value indicating whether the specified capability name is a known capability name which has a type-safe option.
    /// </summary>
    /// <param name="capabilityName">The name of the capability to check.</param>
    /// <returns><see langword="true"/> if the capability name is known; otherwise <see langword="false"/>.</returns>
    protected bool IsKnownCapabilityName(string capabilityName)
    {
        return this.knownCapabilityNames.ContainsKey(capabilityName);
    }

    /// <summary>
    /// Gets a value indicating whether the specified capability name is a known capability name which has a type-safe option.
    /// </summary>
    /// <param name="capabilityName">The name of the capability to check.</param>
    /// <param name="typeSafeOptionName">The name of the type-safe option for the given capability name, or <see langword="null"/> if not found.</param>
    /// <returns><see langword="true"/> if the capability name is known; otherwise <see langword="false"/>.</returns>
    protected bool TryGetKnownCapability(string capabilityName, [NotNullWhen(true)] out string? typeSafeOptionName)
    {
        return this.knownCapabilityNames.TryGetValue(capabilityName, out typeSafeOptionName);
    }

    /// <summary>
    /// Gets the name of the type-safe option for a given capability name.
    /// </summary>
    /// <param name="capabilityName">The name of the capability to check.</param>
    /// <returns>The name of the type-safe option for the given capability name.</returns>
    protected string GetTypeSafeOptionName(string capabilityName)
    {
        if (!this.IsKnownCapabilityName(capabilityName))
        {
            return string.Empty;
        }

        return this.knownCapabilityNames[capabilityName];
    }

    /// <summary>
    /// Generates the logging preferences dictionary for transmission as a desired capability.
    /// </summary>
    /// <returns>The dictionary containing the logging preferences.</returns>
    protected Dictionary<string, object>? GenerateLoggingPreferencesDictionary()
    {
        if (this.loggingPreferences.Count == 0)
        {
            return null;
        }

        Dictionary<string, object> loggingPreferenceCapability = new Dictionary<string, object>();
        foreach (string logType in this.loggingPreferences.Keys)
        {
            loggingPreferenceCapability[logType] = this.loggingPreferences[logType].ToString().ToUpperInvariant();
        }

        return loggingPreferenceCapability;
    }

    /// <summary>
    /// Generates the current options as a capabilities object for further processing.
    /// </summary>
    /// <param name="isSpecificationCompliant">A value indicating whether to generate capabilities compliant with the W3C WebDriver Specification.</param>
    /// <returns>A <see cref="IWritableCapabilities"/> object representing the current options for further processing.</returns>
    protected IWritableCapabilities GenerateDesiredCapabilities(bool isSpecificationCompliant)
    {
        DesiredCapabilities capabilities = new DesiredCapabilities();
        if (!string.IsNullOrEmpty(this.BrowserName))
        {
            capabilities.SetCapability(CapabilityType.BrowserName, this.BrowserName!);
        }

        if (!string.IsNullOrEmpty(this.BrowserVersion))
        {
            capabilities.SetCapability(CapabilityType.BrowserVersion, this.BrowserVersion!);
        }

        if (!string.IsNullOrEmpty(this.PlatformName))
        {
            capabilities.SetCapability(CapabilityType.PlatformName, this.PlatformName!);
        }

        if (this.AcceptInsecureCertificates.HasValue)
        {
            capabilities.SetCapability(CapabilityType.AcceptInsecureCertificates, this.AcceptInsecureCertificates);
        }

        if (this.UseWebSocketUrl.HasValue)
        {
            capabilities.SetCapability(CapabilityType.WebSocketUrl, this.UseWebSocketUrl);
        }

        if (this.EnableDownloads.HasValue)
        {
            capabilities.SetCapability(CapabilityType.EnableDownloads, this.EnableDownloads);
        }

        if (this.UseStrictFileInteractability)
        {
            capabilities.SetCapability(CapabilityType.UseStrictFileInteractability, true);
        }

        if (this.PageLoadStrategy != PageLoadStrategy.Default)
        {
            string pageLoadStrategySetting = "normal";
            switch (this.PageLoadStrategy)
            {
                case PageLoadStrategy.Eager:
                    pageLoadStrategySetting = "eager";
                    break;

                case PageLoadStrategy.None:
                    pageLoadStrategySetting = "none";
                    break;
            }

            capabilities.SetCapability(CapabilityType.PageLoadStrategy, pageLoadStrategySetting);
        }

        if (this.UnhandledPromptBehavior != UnhandledPromptBehavior.Default)
        {
            string unhandledPropmtBehaviorSetting = "ignore";
            switch (this.UnhandledPromptBehavior)
            {
                case UnhandledPromptBehavior.Accept:
                    unhandledPropmtBehaviorSetting = "accept";
                    break;

                case UnhandledPromptBehavior.Dismiss:
                    unhandledPropmtBehaviorSetting = "dismiss";
                    break;

                case UnhandledPromptBehavior.AcceptAndNotify:
                    unhandledPropmtBehaviorSetting = "accept and notify";
                    break;

                case UnhandledPromptBehavior.DismissAndNotify:
                    unhandledPropmtBehaviorSetting = "dismiss and notify";
                    break;
            }

            capabilities.SetCapability(CapabilityType.UnhandledPromptBehavior, unhandledPropmtBehaviorSetting);
        }

        if (this.Proxy != null)
        {
            Dictionary<string, object?>? proxyCapability = this.Proxy.ToCapability();
            if (!isSpecificationCompliant)
            {
                proxyCapability = this.Proxy.ToLegacyCapability();
            }

            if (proxyCapability != null)
            {
                capabilities.SetCapability(CapabilityType.Proxy, proxyCapability);
            }
        }

        if (this.ScriptTimeout.HasValue || this.PageLoadTimeout.HasValue || this.ImplicitWaitTimeout.HasValue)
        {
            var timeouts = new Timeout
            {
                Script = this.ScriptTimeout,
                PageLoad = this.PageLoadTimeout,
                ImplicitWait = this.ImplicitWaitTimeout
            };

            capabilities.SetCapability(CapabilityType.Timeouts, timeouts.ToCapabilities());
        }

        foreach (KeyValuePair<string, object> pair in this.additionalCapabilities)
        {
            capabilities.SetCapability(pair.Key, pair.Value);
        }

        return capabilities;
    }
}
