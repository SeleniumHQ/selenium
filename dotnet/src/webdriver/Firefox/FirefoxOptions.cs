// <copyright file="FirefoxOptions.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Globalization;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox
{
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

        private bool enableDevToolsProtocol;
        private string browserBinaryLocation;
        private FirefoxDriverLogLevel logLevel = FirefoxDriverLogLevel.Default;
        private FirefoxProfile profile;
        private List<string> firefoxArguments = new List<string>();
        private Dictionary<string, object> profilePreferences = new Dictionary<string, object>();
        private Dictionary<string, object> additionalFirefoxOptions = new Dictionary<string, object>();
        private Dictionary<string, object> environmentVariables = new Dictionary<string, object>();

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
        }

        /// <summary>
        /// Gets or sets a value indicating whether to use the legacy driver implementation.
        /// </summary>
        [Obsolete(".NET bindings no longer support the legacy driver implementation. Setting this property no longer has any effect. .NET users should always be using geckodriver.")]
        public bool UseLegacyImplementation
        {
            get { return false; }
            set { }
        }

        /// <summary>
        /// Gets or sets the <see cref="FirefoxProfile"/> object to be used with this instance.
        /// </summary>
        public FirefoxProfile Profile
        {
            get { return this.profile; }
            set { this.profile = value; }
        }

        /// <summary>
        /// Gets or sets the path and file name of the Firefox browser executable.
        /// </summary>
        public string BrowserExecutableLocation
        {
            get { return this.browserBinaryLocation; }
            set { this.browserBinaryLocation = value; }
        }

        /// <summary>
        /// Gets or sets the logging level of the Firefox driver.
        /// </summary>
        public FirefoxDriverLogLevel LogLevel
        {
            get { return this.logLevel; }
            set { this.logLevel = value; }
        }

        public bool EnableDevToolsProtocol
        {
            get { return this.enableDevToolsProtocol; }
            set { this.enableDevToolsProtocol = value; }
        }

        /// <summary>
        /// Adds an argument to be used in launching the Firefox browser.
        /// </summary>
        /// <param name="argumentName">The argument to add.</param>
        /// <remarks>Arguments must be preceeded by two dashes ("--").</remarks>
        public void AddArgument(string argumentName)
        {
            if (string.IsNullOrEmpty(argumentName))
            {
                throw new ArgumentException("argumentName must not be null or empty", "argumentName");
            }

            this.AddArguments(argumentName);
        }

        /// <summary>
        /// Adds a list arguments to be used in launching the Firefox browser.
        /// </summary>
        /// <param name="argumentsToAdd">An array of arguments to add.</param>
        /// <remarks>Each argument must be preceeded by two dashes ("--").</remarks>
        public void AddArguments(params string[] argumentsToAdd)
        {
            this.AddArguments(new List<string>(argumentsToAdd));
        }

        /// <summary>
        /// Adds a list arguments to be used in launching the Firefox browser.
        /// </summary>
        /// <param name="argumentsToAdd">An array of arguments to add.</param>
        public void AddArguments(IEnumerable<string> argumentsToAdd)
        {
            if (argumentsToAdd == null)
            {
                throw new ArgumentNullException("argumentsToAdd", "argumentsToAdd must not be null");
            }

            this.firefoxArguments.AddRange(argumentsToAdd);
        }

        /// <summary>
        /// Sets a preference in the profile used by Firefox.
        /// </summary>
        /// <param name="preferenceName">Name of the preference to set.</param>
        /// <param name="preferenceValue">Value of the preference to set.</param>
        public void SetPreference(string preferenceName, bool preferenceValue)
        {
            this.SetPreferenceValue(preferenceName, preferenceValue);
        }

        /// <summary>
        /// Sets a preference in the profile used by Firefox.
        /// </summary>
        /// <param name="preferenceName">Name of the preference to set.</param>
        /// <param name="preferenceValue">Value of the preference to set.</param>
        public void SetPreference(string preferenceName, int preferenceValue)
        {
            this.SetPreferenceValue(preferenceName, preferenceValue);
        }

        /// <summary>
        /// Sets a preference in the profile used by Firefox.
        /// </summary>
        /// <param name="preferenceName">Name of the preference to set.</param>
        /// <param name="preferenceValue">Value of the preference to set.</param>
        public void SetPreference(string preferenceName, long preferenceValue)
        {
            this.SetPreferenceValue(preferenceName, preferenceValue);
        }

        /// <summary>
        /// Sets a preference in the profile used by Firefox.
        /// </summary>
        /// <param name="preferenceName">Name of the preference to set.</param>
        /// <param name="preferenceValue">Value of the preference to set.</param>
        public void SetPreference(string preferenceName, double preferenceValue)
        {
            this.SetPreferenceValue(preferenceName, preferenceValue);
        }

        /// <summary>
        /// Sets a preference in the profile used by Firefox.
        /// </summary>
        /// <param name="preferenceName">Name of the preference to set.</param>
        /// <param name="preferenceValue">Value of the preference to set.</param>
        public void SetPreference(string preferenceName, string preferenceValue)
        {
            this.SetPreferenceValue(preferenceName, preferenceValue);
        }

        /// <summary>
        /// Sets an environment variable to be set in the operating system's environment under which the Firerox browser is launched.
        /// </summary>
        /// <param name="variableName">The name of the environment variable.</param>
        /// <param name="variableValue">The value of the environment variable.</param>
        public void SetEnvironmentVariable(string variableName, string variableValue)
        {
            if (string.IsNullOrEmpty(variableName))
            {
                throw new ArgumentException("Environment variable name cannot be null or an empty string");
            }

            if (variableValue == null)
            {
                variableValue = string.Empty;
            }

            this.environmentVariables[variableName] = variableValue;
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
        /// Provides a means to add additional capabilities not yet added as type safe options
        /// for the Firefox driver.
        /// </summary>
        /// <param name="capabilityName">The name of the capability to add.</param>
        /// <param name="capabilityValue">The value of the capability to add.</param>
        /// <exception cref="ArgumentException">
        /// thrown when attempting to add a capability for which there is already a type safe option, or
        /// when <paramref name="capabilityName"/> is <see langword="null"/> or the empty string.
        /// </exception>
        /// <remarks>Calling <see cref="AddAdditionalCapability(string, object)"/>
        /// where <paramref name="capabilityName"/> has already been added will overwrite the
        /// existing value with the new value in <paramref name="capabilityValue"/>.
        /// Also, by default, calling this method adds capabilities to the options object passed to
        /// geckodriver.exe.</remarks>
        [Obsolete("Use the temporary AddAdditionalOption method or the AddAdditionalFirefoxOption method for adding additional options")]
        public override void AddAdditionalCapability(string capabilityName, object capabilityValue)
        {
            // Add the capability to the FirefoxOptions object by default. This is to handle
            // the 80% case where the geckodriver team adds a new option in geckodriver.exe
            // and the bindings have not yet had a type safe option added.
            this.AddAdditionalFirefoxOption(capabilityName, capabilityValue);
        }

        /// <summary>
        /// Provides a means to add additional capabilities not yet added as type safe options
        /// for the Firefox driver.
        /// </summary>
        /// <param name="capabilityName">The name of the capability to add.</param>
        /// <param name="capabilityValue">The value of the capability to add.</param>
        /// <param name="isGlobalCapability">Indicates whether the capability is to be set as a global
        /// capability for the driver instead of a Firefox-specific option.</param>
        /// <exception cref="ArgumentException">
        /// thrown when attempting to add a capability for which there is already a type safe option, or
        /// when <paramref name="capabilityName"/> is <see langword="null"/> or the empty string.
        /// </exception>
        /// <remarks>Calling <see cref="AddAdditionalCapability(string, object, bool)"/>
        /// where <paramref name="capabilityName"/> has already been added will overwrite the
        /// existing value with the new value in <paramref name="capabilityValue"/></remarks>
        [Obsolete("Use the temporary AddAdditionalOption method or the AddAdditionalFirefoxOption method for adding additional options")]
        public void AddAdditionalCapability(string capabilityName, object capabilityValue, bool isGlobalCapability)
        {
            if (isGlobalCapability)
            {
                this.AddAdditionalOption(capabilityName, capabilityValue);
            }
            else
            {
                this.AddAdditionalFirefoxOption(capabilityName, capabilityValue);
            }
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
            if (this.enableDevToolsProtocol)
            {
                capabilities.SetCapability(FirefoxEnableDevToolsProtocolCapability, true);
            }

            return capabilities.AsReadOnly();
        }

        private Dictionary<string, object> GenerateFirefoxOptionsDictionary()
        {
            Dictionary<string, object> firefoxOptions = new Dictionary<string, object>();

            if (this.profile != null)
            {
                firefoxOptions[FirefoxProfileCapability] = this.profile.ToBase64String();
            }

            if (!string.IsNullOrEmpty(this.browserBinaryLocation))
            {
                firefoxOptions[FirefoxBinaryCapability] = this.browserBinaryLocation;
            }

            if (this.logLevel != FirefoxDriverLogLevel.Default)
            {
                Dictionary<string, object> logObject = new Dictionary<string, object>();
                logObject["level"] = this.logLevel.ToString().ToLowerInvariant();
                firefoxOptions[FirefoxLogCapability] = logObject;
            }

            if (this.firefoxArguments.Count > 0)
            {
                List<object> args = new List<object>();
                foreach (string argument in this.firefoxArguments)
                {
                    args.Add(argument);
                }

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
                throw new ArgumentException("Preference name may not be null an empty string.", "preferenceName");
            }

            this.profilePreferences[preferenceName] = preferenceValue;
        }
    }
}
