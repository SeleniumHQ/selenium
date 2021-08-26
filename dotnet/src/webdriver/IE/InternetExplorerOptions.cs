// <copyright file="InternetExplorerOptions.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Specifies the scroll behavior of elements scrolled into view in the IE driver.
    /// </summary>
    public enum InternetExplorerElementScrollBehavior
    {
        /// <summary>
        /// Indicates the behavior is unspecified.
        /// </summary>
        Default,

        /// <summary>
        /// Scrolls elements to align with the top of the viewport.
        /// </summary>
        Top,

        /// <summary>
        /// Scrolls elements to align with the bottom of the viewport.
        /// </summary>
        Bottom
    }

    /// <summary>
    /// Class to manage options specific to <see cref="InternetExplorerDriver"/>
    /// </summary>
    /// <example>
    /// <code>
    /// InternetExplorerOptions options = new InternetExplorerOptions();
    /// options.IntroduceInstabilityByIgnoringProtectedModeSettings = true;
    /// </code>
    /// <para></para>
    /// <para>For use with InternetExplorerDriver:</para>
    /// <para></para>
    /// <code>
    /// InternetExplorerDriver driver = new InternetExplorerDriver(options);
    /// </code>
    /// <para></para>
    /// <para>For use with RemoteWebDriver:</para>
    /// <para></para>
    /// <code>
    /// RemoteWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/wd/hub"), options.ToCapabilities());
    /// </code>
    /// </example>
    public class InternetExplorerOptions : DriverOptions
    {
        /// <summary>
        /// Gets the name of the capability used to store IE options in
        /// an <see cref="ICapabilities"/> object.
        /// </summary>
        public static readonly string Capability = "se:ieOptions";

        private const string BrowserNameValue = "internet explorer";

        private const string IgnoreProtectedModeSettingsCapability = "ignoreProtectedModeSettings";
        private const string IgnoreZoomSettingCapability = "ignoreZoomSetting";
        private const string InitialBrowserUrlCapability = "initialBrowserUrl";
        private const string EnablePersistentHoverCapability = "enablePersistentHover";
        private const string ElementScrollBehaviorCapability = "elementScrollBehavior";
        private const string RequireWindowFocusCapability = "requireWindowFocus";
        private const string BrowserAttachTimeoutCapability = "browserAttachTimeout";
        private const string BrowserCommandLineSwitchesCapability = "ie.browserCommandLineSwitches";
        private const string ForceCreateProcessApiCapability = "ie.forceCreateProcessApi";
        private const string UsePerProcessProxyCapability = "ie.usePerProcessProxy";
        private const string EnsureCleanSessionCapability = "ie.ensureCleanSession";
        private const string ForceShellWindowsApiCapability = "ie.forceShellWindowsApi";
        private const string FileUploadDialogTimeoutCapability = "ie.fileUploadDialogTimeout";
        private const string EnableFullPageScreenshotCapability = "ie.enableFullPageScreenshot";
        private const string EdgeExecutablePathCapability = "ie.edgepath";
        private const string LegacyFileUploadDialogHandlingCapability = "ie.useLegacyFileUploadDialogHandling";
        private const string AttachToEdgeChromeCapability = "ie.edgechromium";

        private bool ignoreProtectedModeSettings;
        private bool ignoreZoomLevel;
        private bool enableNativeEvents = true;
        private bool requireWindowFocus;
        private bool enablePersistentHover = true;
        private bool forceCreateProcessApi;
        private bool forceShellWindowsApi;
        private bool usePerProcessProxy;
        private bool ensureCleanSession;
        private bool enableFullPageScreenshot = true;
        private bool legacyFileUploadDialogHandling;
        private bool attachToEdgeChrome;
        private TimeSpan browserAttachTimeout = TimeSpan.MinValue;
        private TimeSpan fileUploadDialogTimeout = TimeSpan.MinValue;
        private string initialBrowserUrl = string.Empty;
        private string browserCommandLineArguments = string.Empty;
        private string edgeExecutablePath = string.Empty;
        private InternetExplorerElementScrollBehavior elementScrollBehavior = InternetExplorerElementScrollBehavior.Default;
        private Dictionary<string, object> additionalInternetExplorerOptions = new Dictionary<string, object>();

        /// <summary>
        /// Initializes a new instance of the <see cref="InternetExplorerOptions"/> class.
        /// </summary>
        public InternetExplorerOptions() : base()
        {
            this.BrowserName = BrowserNameValue;
            this.PlatformName = "windows";
            this.AddKnownCapabilityName(Capability, "current InterentExplorerOptions class instance");
            this.AddKnownCapabilityName(IgnoreProtectedModeSettingsCapability, "IntroduceInstabilityByIgnoringProtectedModeSettings property");
            this.AddKnownCapabilityName(IgnoreZoomSettingCapability, "IgnoreZoomLevel property");
            this.AddKnownCapabilityName(CapabilityType.HasNativeEvents, "EnableNativeEvents property");
            this.AddKnownCapabilityName(InitialBrowserUrlCapability, "InitialBrowserUrl property");
            this.AddKnownCapabilityName(ElementScrollBehaviorCapability, "ElementScrollBehavior property");
            this.AddKnownCapabilityName(CapabilityType.UnexpectedAlertBehavior, "UnhandledPromptBehavior property");
            this.AddKnownCapabilityName(EnablePersistentHoverCapability, "EnablePersistentHover property");
            this.AddKnownCapabilityName(RequireWindowFocusCapability, "RequireWindowFocus property");
            this.AddKnownCapabilityName(BrowserAttachTimeoutCapability, "BrowserAttachTimeout property");
            this.AddKnownCapabilityName(ForceCreateProcessApiCapability, "ForceCreateProcessApi property");
            this.AddKnownCapabilityName(ForceShellWindowsApiCapability, "ForceShellWindowsApi property");
            this.AddKnownCapabilityName(BrowserCommandLineSwitchesCapability, "BrowserComaandLineArguments property");
            this.AddKnownCapabilityName(UsePerProcessProxyCapability, "UsePerProcessProxy property");
            this.AddKnownCapabilityName(EnsureCleanSessionCapability, "EnsureCleanSession property");
            this.AddKnownCapabilityName(FileUploadDialogTimeoutCapability, "FileUploadDialogTimeout property");
            this.AddKnownCapabilityName(EnableFullPageScreenshotCapability, "EnableFullPageScreenshot property");
            this.AddKnownCapabilityName(LegacyFileUploadDialogHandlingCapability, "LegacyFileUploadDialogHanlding property");
            this.AddKnownCapabilityName(AttachToEdgeChromeCapability, "AttachToEdgeChrome property");
            this.AddKnownCapabilityName(EdgeExecutablePathCapability, "EdgeExecutablePath property");
        }

        /// <summary>
        /// Gets or sets a value indicating whether to ignore the settings of the Internet Explorer Protected Mode.
        /// </summary>
        public bool IntroduceInstabilityByIgnoringProtectedModeSettings
        {
            get { return this.ignoreProtectedModeSettings; }
            set { this.ignoreProtectedModeSettings = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to ignore the zoom level of Internet Explorer .
        /// </summary>
        public bool IgnoreZoomLevel
        {
            get { return this.ignoreZoomLevel; }
            set { this.ignoreZoomLevel = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to use native events in interacting with elements.
        /// </summary>
        public bool EnableNativeEvents
        {
            get { return this.enableNativeEvents; }
            set { this.enableNativeEvents = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to require the browser window to have focus before interacting with elements.
        /// </summary>
        public bool RequireWindowFocus
        {
            get { return this.requireWindowFocus; }
            set { this.requireWindowFocus = value; }
        }

        /// <summary>
        /// Gets or sets the initial URL displayed when IE is launched. If not set, the browser launches
        /// with the internal startup page for the WebDriver server.
        /// </summary>
        /// <remarks>
        /// By setting the  <see cref="IntroduceInstabilityByIgnoringProtectedModeSettings"/> to <see langword="true"/>
        /// and this property to a correct URL, you can launch IE in the Internet Protected Mode zone. This can be helpful
        /// to avoid the flakiness introduced by ignoring the Protected Mode settings. Nevertheless, setting Protected Mode
        /// zone settings to the same value in the IE configuration is the preferred method.
        /// </remarks>
        public string InitialBrowserUrl
        {
            get { return this.initialBrowserUrl; }
            set { this.initialBrowserUrl = value; }
        }

        /// <summary>
        /// Gets or sets the value for describing how elements are scrolled into view in the IE driver. Defaults
        /// to scrolling the element to the top of the viewport.
        /// </summary>
        public InternetExplorerElementScrollBehavior ElementScrollBehavior
        {
            get { return this.elementScrollBehavior; }
            set { this.elementScrollBehavior = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to enable persistently sending WM_MOUSEMOVE messages
        /// to the IE window during a mouse hover.
        /// </summary>
        public bool EnablePersistentHover
        {
            get { return this.enablePersistentHover; }
            set { this.enablePersistentHover = value; }
        }

        /// <summary>
        /// Gets or sets the amount of time the driver will attempt to look for a newly launched instance
        /// of Internet Explorer.
        /// </summary>
        public TimeSpan BrowserAttachTimeout
        {
            get { return this.browserAttachTimeout; }
            set { this.browserAttachTimeout = value; }
        }

        /// <summary>
        /// Gets or sets the amount of time the driver will attempt to look for the file selection
        /// dialog when attempting to upload a file.
        /// </summary>
        public TimeSpan FileUploadDialogTimeout
        {
            get { return this.fileUploadDialogTimeout; }
            set { this.fileUploadDialogTimeout = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to force the use of the Windows CreateProcess API
        /// when launching Internet Explorer. The default value is <see langword="false"/>.
        /// </summary>
        public bool ForceCreateProcessApi
        {
            get { return this.forceCreateProcessApi; }
            set { this.forceCreateProcessApi = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to force the use of the Windows ShellWindows API
        /// when attaching to Internet Explorer. The default value is <see langword="false"/>.
        /// </summary>
        public bool ForceShellWindowsApi
        {
            get { return this.forceShellWindowsApi; }
            set { this.forceShellWindowsApi = value; }
        }

        /// <summary>
        /// Gets or sets the command line arguments used in launching Internet Explorer when the
        /// Windows CreateProcess API is used. This property only has an effect when the
        /// <see cref="ForceCreateProcessApi"/> is <see langword="true"/>.
        /// </summary>
        public string BrowserCommandLineArguments
        {
            get { return this.browserCommandLineArguments; }
            set { this.browserCommandLineArguments = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to use the supplied <see cref="Proxy"/>
        /// settings on a per-process basis, not updating the system installed proxy setting.
        /// This property is only valid when setting a <see cref="Proxy"/>, where the
        /// <see cref="OpenQA.Selenium.Proxy.Kind"/> property is either <see cref="ProxyKind.Direct"/>,
        /// <see cref="ProxyKind.System"/>, or <see cref="ProxyKind.Manual"/>, and is
        /// otherwise ignored. Defaults to <see langword="false"/>.
        /// </summary>
        public bool UsePerProcessProxy
        {
            get { return this.usePerProcessProxy; }
            set { this.usePerProcessProxy = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to clear the Internet Explorer cache
        /// before launching the browser. When set to <see langword="true"/>, clears the
        /// system cache for all instances of Internet Explorer, even those already running
        /// when the driven instance is launched. Defaults to <see langword="false"/>.
        /// </summary>
        public bool EnsureCleanSession
        {
            get { return this.ensureCleanSession; }
            set { this.ensureCleanSession = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to use the legacy handling for file upload dialogs.
        /// </summary>
        public bool LegacyFileUploadDialogHanlding
        {
            get { return this.legacyFileUploadDialogHandling; }
            set { this.legacyFileUploadDialogHandling = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to attach to Edge Chrome browser.
        /// </summary>
        public bool AttachToEdgeChrome
        {
            get { return this.attachToEdgeChrome; }
            set { this.attachToEdgeChrome = value; }
        }

        /// <summary>
        /// Gets or sets the path to the Edge Browser Executable.
        /// </summary>
        public string EdgeExecutablePath
        {
            get { return this.edgeExecutablePath; }
            set { this.edgeExecutablePath = value; }
        }

        /// <summary>
        /// Provides a means to add additional capabilities not yet added as type safe options
        /// for the Internet Explorer driver.
        /// </summary>
        /// <param name="optionName">The name of the capability to add.</param>
        /// <param name="optionValue">The value of the capability to add.</param>
        /// <exception cref="ArgumentException">
        /// thrown when attempting to add a capability for which there is already a type safe option, or
        /// when <paramref name="optionName"/> is <see langword="null"/> or the empty string.
        /// </exception>
        /// <remarks>Calling <see cref="AddAdditionalInternetExplorerOption(string, object)"/>
        /// where <paramref name="optionName"/> has already been added will overwrite the
        /// existing value with the new value in <paramref name="optionValue"/>.
        /// Calling this method adds capabilities to the IE-specific options object passed to
        /// IEDriverServer.exe (property name 'se:ieOptions').</remarks>
        public void AddAdditionalInternetExplorerOption(string optionName, object optionValue)
        {
            this.ValidateCapabilityName(optionName);
            this.additionalInternetExplorerOptions[optionName] = optionValue;
        }

        /// <summary>
        /// Provides a means to add additional capabilities not yet added as type safe options
        /// for the Internet Explorer driver.
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
        /// IEDriverServer.exe.</remarks>
        [Obsolete("Use the temporary AddAdditionalOption method or the AddAdditionalInternetExplorerOption method for adding additional options")]
        public override void AddAdditionalCapability(string capabilityName, object capabilityValue)
        {
            // Add the capability to the ieOptions object by default. This is to handle
            // the 80% case where the IE driver adds a new option in IEDriverServer.exe
            // and the bindings have not yet had a type safe option added.
            this.AddAdditionalCapability(capabilityName, capabilityValue, false);
        }

        /// <summary>
        /// Provides a means to add additional capabilities not yet added as type safe options
        /// for the Internet Explorer driver.
        /// </summary>
        /// <param name="capabilityName">The name of the capability to add.</param>
        /// <param name="capabilityValue">The value of the capability to add.</param>
        /// <param name="isGlobalCapability">Indicates whether the capability is to be set as a global
        /// capability for the driver instead of a IE-specific option.</param>
        /// <exception cref="ArgumentException">
        /// thrown when attempting to add a capability for which there is already a type safe option, or
        /// when <paramref name="capabilityName"/> is <see langword="null"/> or the empty string.
        /// </exception>
        /// <remarks>Calling <see cref="AddAdditionalCapability(string, object, bool)"/> where <paramref name="capabilityName"/>
        /// has already been added will overwrite the existing value with the new value in <paramref name="capabilityValue"/></remarks>
        [Obsolete("Use the temporary AddAdditionalOption method or the AddAdditionalInternetExplorerOption method for adding additional options")]
        public void AddAdditionalCapability(string capabilityName, object capabilityValue, bool isGlobalCapability)
        {
            if (isGlobalCapability)
            {
                this.AddAdditionalOption(capabilityName, capabilityValue);
            }
            else
            {
                this.AddAdditionalInternetExplorerOption(capabilityName, capabilityValue);
            }
        }

        /// <summary>
        /// Returns DesiredCapabilities for IE with these options included as
        /// capabilities. This copies the options. Further changes will not be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The DesiredCapabilities for IE with these options.</returns>
        public override ICapabilities ToCapabilities()
        {
            IWritableCapabilities capabilities = this.GenerateDesiredCapabilities(true);

            Dictionary<string, object> internetExplorerOptions = this.BuildInternetExplorerOptionsDictionary();
            capabilities.SetCapability(InternetExplorerOptions.Capability, internetExplorerOptions);

            return capabilities.AsReadOnly();
        }

        private Dictionary<string, object> BuildInternetExplorerOptionsDictionary()
        {
            Dictionary<string, object> internetExplorerOptionsDictionary = new Dictionary<string, object>();
            internetExplorerOptionsDictionary[CapabilityType.HasNativeEvents] = this.enableNativeEvents;
            internetExplorerOptionsDictionary[EnablePersistentHoverCapability] = this.enablePersistentHover;

            if (this.requireWindowFocus)
            {
                internetExplorerOptionsDictionary[RequireWindowFocusCapability] = true;
            }

            if (this.ignoreProtectedModeSettings)
            {
                internetExplorerOptionsDictionary[IgnoreProtectedModeSettingsCapability] = true;
            }

            if (this.ignoreZoomLevel)
            {
                internetExplorerOptionsDictionary[IgnoreZoomSettingCapability] = true;
            }

            if (!string.IsNullOrEmpty(this.initialBrowserUrl))
            {
                internetExplorerOptionsDictionary[InitialBrowserUrlCapability] = this.initialBrowserUrl;
            }

            if (this.elementScrollBehavior != InternetExplorerElementScrollBehavior.Default)
            {
                if (this.elementScrollBehavior == InternetExplorerElementScrollBehavior.Bottom)
                {
                    internetExplorerOptionsDictionary[ElementScrollBehaviorCapability] = 1;
                }
                else
                {
                    internetExplorerOptionsDictionary[ElementScrollBehaviorCapability] = 0;
                }
            }

            if (this.browserAttachTimeout != TimeSpan.MinValue)
            {
                internetExplorerOptionsDictionary[BrowserAttachTimeoutCapability] = Convert.ToInt32(this.browserAttachTimeout.TotalMilliseconds);
            }

            if (this.fileUploadDialogTimeout != TimeSpan.MinValue)
            {
                internetExplorerOptionsDictionary[FileUploadDialogTimeoutCapability] = Convert.ToInt32(this.fileUploadDialogTimeout.TotalMilliseconds);
            }

            if (this.forceCreateProcessApi)
            {
                internetExplorerOptionsDictionary[ForceCreateProcessApiCapability] = true;
                if (!string.IsNullOrEmpty(this.browserCommandLineArguments))
                {
                    internetExplorerOptionsDictionary[BrowserCommandLineSwitchesCapability] = this.browserCommandLineArguments;
                }
            }

            if (this.forceShellWindowsApi)
            {
                internetExplorerOptionsDictionary[ForceShellWindowsApiCapability] = true;
            }

            if (this.Proxy != null)
            {
                internetExplorerOptionsDictionary[UsePerProcessProxyCapability] = this.usePerProcessProxy;
            }

            if (this.ensureCleanSession)
            {
                internetExplorerOptionsDictionary[EnsureCleanSessionCapability] = true;
            }

            if (!this.enableFullPageScreenshot)
            {
                internetExplorerOptionsDictionary[EnableFullPageScreenshotCapability] = false;
            }

            if (this.legacyFileUploadDialogHandling)
            {
                internetExplorerOptionsDictionary[LegacyFileUploadDialogHandlingCapability] = true;
            }

            if (this.attachToEdgeChrome)
            {
                internetExplorerOptionsDictionary[AttachToEdgeChromeCapability] = true;
            }

            if (!string.IsNullOrEmpty(this.edgeExecutablePath))
            {
                internetExplorerOptionsDictionary[EdgeExecutablePathCapability] = this.edgeExecutablePath;
            }

            foreach (KeyValuePair<string, object> pair in this.additionalInternetExplorerOptions)
            {
                internetExplorerOptionsDictionary[pair.Key] = pair.Value;
            }

            return internetExplorerOptionsDictionary;
        }
    }
}
