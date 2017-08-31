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
        /// Scrolls elements to align with the top of the viewport.
        /// </summary>
        Top,

        /// <summary>
        /// Scrolls elements to align with the bottom of the viewport.
        /// </summary>
        Bottom
    }

    /// <summary>
    /// Specifies the behavior of handling unexpected alerts in the IE driver.
    /// </summary>
    public enum InternetExplorerUnexpectedAlertBehavior
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
        Dismiss
    }

    /// <summary>
    /// Specifies the behavior of waiting for page loads in the IE driver.
    /// </summary>
    public enum InternetExplorerPageLoadStrategy
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
        /// a <see cref="DesiredCapabilities"/> object.
        /// </summary>
        public static readonly string Capability = "se:ieOptions";

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
        private const string ValidateCookieDocumentTypeCapability = "ie.validateCookieDocumentType";
        private const string FileUploadDialogTimeoutCapability = "ie.fileUploadDialogTimeout";
        private const string EnableFullPageScreenshotCapability = "ie.enableFullPageScreenshot";

        private bool ignoreProtectedModeSettings;
        private bool ignoreZoomLevel;
        private bool enableNativeEvents = true;
        private bool requireWindowFocus;
        private bool enablePersistentHover = true;
        private bool forceCreateProcessApi;
        private bool forceShellWindowsApi;
        private bool usePerProcessProxy;
        private bool ensureCleanSession;
        private bool validateCookieDocumentType = true;
        private bool enableFullPageScreenshot = true;
        private TimeSpan browserAttachTimeout = TimeSpan.MinValue;
        private TimeSpan fileUploadDialogTimeout = TimeSpan.MinValue;
        private string initialBrowserUrl = string.Empty;
        private string browserCommandLineArguments = string.Empty;
        private InternetExplorerElementScrollBehavior elementScrollBehavior = InternetExplorerElementScrollBehavior.Top;
        private InternetExplorerUnexpectedAlertBehavior unexpectedAlertBehavior = InternetExplorerUnexpectedAlertBehavior.Default;
        private InternetExplorerPageLoadStrategy pageLoadStrategy = InternetExplorerPageLoadStrategy.Default;
        private Proxy proxy;
        private Dictionary<string, object> additionalCapabilities = new Dictionary<string, object>();
        private Dictionary<string, object> additionalInternetExplorerOptions = new Dictionary<string, object>();

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
        /// Gets or sets the value for describing how unexpected alerts are to be handled in the IE driver.
        /// Defaults to <see cref="InternetExplorerUnexpectedAlertBehavior.Default"/>.
        /// </summary>
        public InternetExplorerUnexpectedAlertBehavior UnexpectedAlertBehavior
        {
            get { return this.unexpectedAlertBehavior; }
            set { this.unexpectedAlertBehavior = value; }
        }

        /// <summary>
        /// Gets or sets the value for describing how the browser is to wait for pages to load in the IE driver.
        /// Defaults to <see cref="InternetExplorerPageLoadStrategy.Default"/>.
        /// </summary>
        public InternetExplorerPageLoadStrategy PageLoadStrategy
        {
            get { return this.pageLoadStrategy; }
            set { this.pageLoadStrategy = value; }
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
        /// Gets or sets a value indicating whether to validate the document type of the loaded
        /// document when setting cookies.
        /// </summary>
        [Obsolete("The IE driver no longer validates document types for cookie retrieval or setting. This property will be removed in a future release.")]
        public bool ValidateCookieDocumentType
        {
            get { return this.validateCookieDocumentType; }
            set { this.validateCookieDocumentType = value; }
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
        /// Gets or sets the <see cref="Proxy"/> to be used with Internet Explorer. By default,
        /// will install the specified proxy to be the system proxy, used by all instances of
        /// Internet Explorer. To change this default behavior, change the <see cref="UsePerProcessProxy"/>
        /// property.
        /// </summary>
        public Proxy Proxy
        {
            get { return this.proxy; }
            set { this.proxy = value; }
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
        /// Gets or sets a value indicating whether to enable full-page screenshots for
        /// the IE driver. Defaults to <see langword="true"/>.
        /// </summary>
        public bool EnableFullPageScreenshot
        {
            get { return this.enableFullPageScreenshot; }
            set { this.enableFullPageScreenshot = value; }
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
        public void AddAdditionalCapability(string capabilityName, object capabilityValue, bool isGlobalCapability)
        {
            if (capabilityName == IgnoreProtectedModeSettingsCapability ||
                capabilityName == IgnoreZoomSettingCapability ||
                capabilityName == CapabilityType.HasNativeEvents ||
                capabilityName == InitialBrowserUrlCapability ||
                capabilityName == ElementScrollBehaviorCapability ||
                capabilityName == CapabilityType.UnexpectedAlertBehavior ||
                capabilityName == EnablePersistentHoverCapability ||
                capabilityName == RequireWindowFocusCapability ||
                capabilityName == BrowserAttachTimeoutCapability ||
                capabilityName == ForceCreateProcessApiCapability ||
                capabilityName == ForceShellWindowsApiCapability ||
                capabilityName == BrowserCommandLineSwitchesCapability ||
                capabilityName == CapabilityType.Proxy ||
                capabilityName == UsePerProcessProxyCapability ||
                capabilityName == EnsureCleanSessionCapability ||
                capabilityName == ValidateCookieDocumentTypeCapability ||
                capabilityName == CapabilityType.PageLoadStrategy ||
                capabilityName == FileUploadDialogTimeoutCapability ||
                capabilityName == EnableFullPageScreenshotCapability)
            {
                string message = string.Format(CultureInfo.InvariantCulture, "There is already an option for the {0} capability. Please use that instead.", capabilityName);
                throw new ArgumentException(message, "capabilityName");
            }

            if (string.IsNullOrEmpty(capabilityName))
            {
                throw new ArgumentException("Capability name may not be null an empty string.", "capabilityName");
            }

            if (isGlobalCapability)
            {
                this.additionalCapabilities[capabilityName] = capabilityValue;
            }
            else
            {
                this.additionalInternetExplorerOptions[capabilityName] = capabilityValue;
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
            DesiredCapabilities capabilities = DesiredCapabilities.InternetExplorer();

            if (this.pageLoadStrategy != InternetExplorerPageLoadStrategy.Default)
            {
                string pageLoadStrategySetting = "normal";
                switch (this.pageLoadStrategy)
                {
                    case InternetExplorerPageLoadStrategy.Eager:
                        pageLoadStrategySetting = "eager";
                        break;

                    case InternetExplorerPageLoadStrategy.None:
                        pageLoadStrategySetting = "none";
                        break;
                }

                capabilities.SetCapability(CapabilityType.PageLoadStrategy, pageLoadStrategySetting);
            }

            if (this.unexpectedAlertBehavior != InternetExplorerUnexpectedAlertBehavior.Default)
            {
                string unexpectedAlertBehaviorSetting = "dismiss";
                switch (this.unexpectedAlertBehavior)
                {
                    case InternetExplorerUnexpectedAlertBehavior.Ignore:
                        unexpectedAlertBehaviorSetting = "ignore";
                        break;

                    case InternetExplorerUnexpectedAlertBehavior.Accept:
                        unexpectedAlertBehaviorSetting = "accept";
                        break;
                }

                capabilities.SetCapability(CapabilityType.UnexpectedAlertBehavior, unexpectedAlertBehaviorSetting);
            }

            if (this.proxy != null)
            {
                Dictionary<string, object> proxyCapability = this.proxy.ToCapability();
                if (proxyCapability != null)
                {
                    capabilities.SetCapability(CapabilityType.Proxy, proxyCapability);
                }
            }

            Dictionary<string, object> internetExplorerOptions = this.BuildInternetExplorerOptionsDictionary();
            capabilities.SetCapability(InternetExplorerOptions.Capability, internetExplorerOptions);

            foreach (KeyValuePair<string, object> pair in this.additionalCapabilities)
            {
                capabilities.SetCapability(pair.Key, pair.Value);
            }

            return capabilities;
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

            if (this.elementScrollBehavior == InternetExplorerElementScrollBehavior.Bottom)
            {
                internetExplorerOptionsDictionary[ElementScrollBehaviorCapability] = 1;
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

            if (this.proxy != null)
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

            foreach (KeyValuePair<string, object> pair in this.additionalInternetExplorerOptions)
            {
                internetExplorerOptionsDictionary[pair.Key] = pair.Value;
            }

            return internetExplorerOptionsDictionary;
        }
    }
}
