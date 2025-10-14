// <copyright file="FirefoxOptions.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.Firefox;

/// <summary>
/// Class to manage options specific to <see cref="FirefoxDriver"/>
/// </summary>
/// <remarks>
/// Used with the marionette executable wires.exe.
/// </remarks>
/// <example>
/// <code>
/// FirefoxOptions options = new FirefoxOptions();
/// </code>
/// <para></para>
/// <para>For use with FirefoxDriver:</para>
/// <para></para>
/// <code>
/// FirefoxDriver driver = new FirefoxDriver(options);
/// </code>
/// <para></para>
/// <para>For use with RemoteWebDriver:</para>
/// <para></para>
/// <code>
/// RemoteWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/wd/hub"), options.ToCapabilities());
/// </code>
/// </example>
public class FirefoxOptions : DriverOptions
{
    private const string BrowserNameValue = "firefox";

    private const string IsMarionetteCapability = "marionette";
    private const string FirefoxLegacyProfileCapability = "firefox_profile";
    private const string FirefoxLegacyBinaryCapability = "firefox_binary";
    private const string FirefoxProfileCapability = "profile";
    private const string FirefoxBinaryCapability = "binary";
    private const string FirefoxArgumentsCapability = "args";
    private const string FirefoxLogCapability = "log";
    private const string FirefoxPrefsCapability = "prefs";
    private const string FirefoxEnvCapability = "env";
    private const string FirefoxOptionsCapability = "moz:firefoxOptions";
    private const string FirefoxEnableDevToolsProtocolCapability = "moz:debuggerAddress";
    private readonly List<string> firefoxArguments = new List<string>();
    private readonly Dictionary<string, object> profilePreferences = new Dictionary<string, object>();
    private readonly Dictionary<string, object> additionalFirefoxOptions = new Dictionary<string, object>();
    private readonly Dictionary<string, object> environmentVariables = new Dictionary<string, object>();

    /// <summary>
    /// Initializes a new instance of the <see cref="FirefoxOptions"/> class.
    /// </summary>
    public FirefoxOptions()
        : base()
    {
        this.BrowserName = BrowserNameValue;
        this.AddKnownCapabilityName(FirefoxOptions.FirefoxOptionsCapability, "current FirefoxOptions class instance");
        this.AddKnownCapabilityName(FirefoxOptions.IsMarionetteCapability, "UseLegacyImplementation property");
        this.AddKnownCapabilityName(FirefoxOptions.FirefoxProfileCapability, "Profile property");
        this.AddKnownCapabilityName(FirefoxOptions.FirefoxBinaryCapability, "BrowserExecutableLocation property");
        this.AddKnownCapabilityName(FirefoxOptions.FirefoxArgumentsCapability, "AddArguments method");
        this.AddKnownCapabilityName(FirefoxOptions.FirefoxPrefsCapability, "SetPreference method");
        this.AddKnownCapabilityName(FirefoxOptions.FirefoxEnvCapability, "SetEnvironmentVariable method");
        this.AddKnownCapabilityName(FirefoxOptions.FirefoxLogCapability, "LogLevel property");
        this.AddKnownCapabilityName(FirefoxOptions.FirefoxLegacyProfileCapability, "Profile property");
        this.AddKnownCapabilityName(FirefoxOptions.FirefoxLegacyBinaryCapability, "BrowserExecutableLocation property");
        this.AddKnownCapabilityName(FirefoxOptions.FirefoxEnableDevToolsProtocolCapability, "EnableDevToolsProtocol property");
        // https://fxdx.dev/deprecating-cdp-support-in-firefox-embracing-the-future-with-webdriver-bidi/.
        // Enable BiDi only
        this.SetPreference("remote.active-protocols", 1);
    }

    /// <summary>
    /// Gets or sets the <see cref="FirefoxProfile"/> object to be used with this instance.
    /// </summary>
    public FirefoxProfile? Profile { get; set; }

    /// <summary>
    /// Gets or sets the path and file name of the Firefox browser executable.
    /// </summary>
    public override string? BinaryLocation { get; set; }

    /// <summary>
    /// Gets or sets the logging level of the Firefox driver.
    /// </summary>
    public FirefoxDriverLogLevel LogLevel { get; set; } = FirefoxDriverLogLevel.Default;

    /// <summary>
    /// Gets or sets a value indicating whether to enable the DevTools protocol for the launched browser.
    /// </summary>
    public bool EnableDevToolsProtocol { get; set; }

    /// <summary>
    /// Gets or sets the options for automating Firefox on Android.
    /// </summary>
    public FirefoxAndroidOptions? AndroidOptions { get; set; }

    /// <summary>
    /// Adds an argument to be used in launching the Firefox browser.
    /// </summary>
    /// <param name="argumentName">The argument to add.</param>
    /// <remarks>Arguments must be preceded by two dashes ("--").</remarks>
    /// <exception cref="ArgumentException">If <paramref name="argumentName"/> is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public void AddArgument(string argumentName)
    {
        if (string.IsNullOrEmpty(argumentName))
        {
            throw new ArgumentException("argumentName must not be null or empty", nameof(argumentName));
        }

        this.AddArguments(argumentName);
    }

    /// <summary>
    /// Adds a list arguments to be used in launching the Firefox browser.
    /// </summary>
    /// <param name="argumentsToAdd">An array of arguments to add.</param>
    /// <remarks>Each argument must be preceded by two dashes ("--").</remarks>
    /// <exception cref="ArgumentNullException">If <paramref name="argumentsToAdd"/> is <see langword="null"/>.</exception>
    public void AddArguments(params string[] argumentsToAdd)
    {
        this.AddArguments((IEnumerable<string>)argumentsToAdd);
    }

    /// <summary>
    /// Adds a list arguments to be used in launching the Firefox browser.
    /// </summary>
    /// <param name="argumentsToAdd">An array of arguments to add.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="argumentsToAdd"/> is <see langword="null"/>.</exception>
    public void AddArguments(IEnumerable<string> argumentsToAdd)
    {
        if (argumentsToAdd == null)
        {
            throw new ArgumentNullException(nameof(argumentsToAdd), "argumentsToAdd must not be null");
        }

        this.firefoxArguments.AddRange(argumentsToAdd);
    }

    /// <summary>
    /// Sets a preference in the profile used by Firefox.
    /// </summary>
    /// <param name="preferenceName">Name of the preference to set.</param>
    /// <param name="preferenceValue">Value of the preference to set.</param>
    /// <exception cref="ArgumentException">If <paramref name="preferenceName"/> is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public void SetPreference(string preferenceName, bool preferenceValue)
    {
        this.SetPreferenceValue(preferenceName, preferenceValue);
    }

    /// <summary>
    /// Sets a preference in the profile used by Firefox.
    /// </summary>
    /// <param name="preferenceName">Name of the preference to set.</param>
    /// <param name="preferenceValue">Value of the preference to set.</param>
    /// <exception cref="ArgumentException">If <paramref name="preferenceName"/> is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public void SetPreference(string preferenceName, int preferenceValue)
    {
        this.SetPreferenceValue(preferenceName, preferenceValue);
    }

    /// <summary>
    /// Sets a preference in the profile used by Firefox.
    /// </summary>
    /// <param name="preferenceName">Name of the preference to set.</param>
    /// <param name="preferenceValue">Value of the preference to set.</param>
    /// <exception cref="ArgumentException">If <paramref name="preferenceName"/> is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public void SetPreference(string preferenceName, long preferenceValue)
    {
        this.SetPreferenceValue(preferenceName, preferenceValue);
    }

    /// <summary>
    /// Sets a preference in the profile used by Firefox.
    /// </summary>
    /// <param name="preferenceName">Name of the preference to set.</param>
    /// <param name="preferenceValue">Value of the preference to set.</param>
    /// <exception cref="ArgumentException">If <paramref name="preferenceName"/> is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public void SetPreference(string preferenceName, double preferenceValue)
    {
        this.SetPreferenceValue(preferenceName, preferenceValue);
    }

    /// <summary>
    /// Sets a preference in the profile used by Firefox.
    /// </summary>
    /// <param name="preferenceName">Name of the preference to set.</param>
    /// <param name="preferenceValue">Value of the preference to set.</param>
    /// <exception cref="ArgumentException">If <paramref name="preferenceName"/> is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public void SetPreference(string preferenceName, string preferenceValue)
    {
        this.SetPreferenceValue(preferenceName, preferenceValue);
    }

    /// <summary>
    /// Sets an environment variable to be set in the operating system's environment under which the Firefox browser is launched.
    /// </summary>
    /// <param name="variableName">The name of the environment variable.</param>
    /// <param name="variableValue">The value of the environment variable.</param>
    /// <exception cref="ArgumentException">If <paramref name="variableName"/> is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public void SetEnvironmentVariable(string variableName, string? variableValue)
    {
        if (string.IsNullOrEmpty(variableName))
        {
            throw new ArgumentException("Environment variable name cannot be null or an empty string");
        }

        this.environmentVariables[variableName] = variableValue ?? string.Empty;
    }

    /// <summary>
    /// Provides a means to add additional capabilities not yet added as type safe options
    /// for the Firefox driver.
    /// </summary>
    /// <param name="optionName">The name of the capability to add.</param>
    /// <param name="optionValue">The value of the capability to add.</param>
    /// <exception cref="ArgumentException">
    /// thrown when attempting to add a capability for which there is already a type safe option, or
    /// when <paramref name="optionName"/> is <see langword="null"/> or the empty string.
    /// </exception>
    /// <remarks>Calling <see cref="AddAdditionalFirefoxOption(string, object)"/>
    /// where <paramref name="optionName"/> has already been added will overwrite the
    /// existing value with the new value in <paramref name="optionValue"/>.
    /// Calling this method adds capabilities to the Firefox-specific options object passed to
    /// geckodriver.exe (property name 'moz:firefoxOptions').</remarks>
    public void AddAdditionalFirefoxOption(string optionName, object optionValue)
    {
        this.ValidateCapabilityName(optionName);
        this.additionalFirefoxOptions[optionName] = optionValue;
    }

    /// <summary>
    /// Returns DesiredCapabilities for Firefox with these options included as
    /// capabilities. This does not copy the options. Further changes will be
    /// reflected in the returned capabilities.
    /// </summary>
    /// <returns>The DesiredCapabilities for Firefox with these options.</returns>
    public override ICapabilities ToCapabilities()
    {
        IWritableCapabilities capabilities = GenerateDesiredCapabilities(true);
        Dictionary<string, object> firefoxOptions = this.GenerateFirefoxOptionsDictionary();
        capabilities.SetCapability(FirefoxOptionsCapability, firefoxOptions);
        if (this.EnableDevToolsProtocol)
        {
            capabilities.SetCapability(FirefoxEnableDevToolsProtocolCapability, true);
        }

        return capabilities.AsReadOnly();
    }

    private Dictionary<string, object> GenerateFirefoxOptionsDictionary()
    {
        Dictionary<string, object> firefoxOptions = new Dictionary<string, object>();

        if (this.Profile != null)
        {
            firefoxOptions[FirefoxProfileCapability] = this.Profile.ToBase64String();
        }

        if (!string.IsNullOrEmpty(this.BinaryLocation))
        {
            firefoxOptions[FirefoxBinaryCapability] = this.BinaryLocation!;
        }

        if (this.LogLevel != FirefoxDriverLogLevel.Default)
        {
            Dictionary<string, object> logObject = new Dictionary<string, object>();
            logObject["level"] = this.LogLevel.ToString().ToLowerInvariant();
            firefoxOptions[FirefoxLogCapability] = logObject;
        }

        if (this.firefoxArguments.Count > 0)
        {
            List<object> args = [.. this.firefoxArguments];

            firefoxOptions[FirefoxArgumentsCapability] = args;
        }

        if (this.profilePreferences.Count > 0)
        {
            firefoxOptions[FirefoxPrefsCapability] = this.profilePreferences;
        }

        if (this.environmentVariables.Count > 0)
        {
            firefoxOptions[FirefoxEnvCapability] = this.environmentVariables;
        }

        if (this.AndroidOptions != null)
        {
            AddAndroidOptions(this.AndroidOptions, firefoxOptions);
        }

        foreach (KeyValuePair<string, object> pair in this.additionalFirefoxOptions)
        {
            firefoxOptions.Add(pair.Key, pair.Value);
        }

        return firefoxOptions;
    }

    private void SetPreferenceValue(string preferenceName, object preferenceValue)
    {
        if (string.IsNullOrEmpty(preferenceName))
        {
            throw new ArgumentException("Preference name may not be null an empty string.", nameof(preferenceName));
        }

        this.profilePreferences[preferenceName] = preferenceValue;
    }

    private static void AddAndroidOptions(FirefoxAndroidOptions androidOptions, Dictionary<string, object> firefoxOptions)
    {
        firefoxOptions["androidPackage"] = androidOptions.AndroidPackage;

        if (!string.IsNullOrEmpty(androidOptions.AndroidDeviceSerial))
        {
            firefoxOptions["androidDeviceSerial"] = androidOptions.AndroidDeviceSerial!;
        }

        if (!string.IsNullOrEmpty(androidOptions.AndroidActivity))
        {
            firefoxOptions["androidActivity"] = androidOptions.AndroidActivity!;
        }

        if (androidOptions.AndroidIntentArguments.Count > 0)
        {
            List<object> args = [.. androidOptions.AndroidIntentArguments];

            firefoxOptions["androidIntentArguments"] = args;
        }
    }
}
