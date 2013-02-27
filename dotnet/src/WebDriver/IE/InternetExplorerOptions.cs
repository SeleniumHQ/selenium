// <copyright file="InternetExplorerOptions.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using System.Text;
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
    public class InternetExplorerOptions
    {
        private const string IgnoreProtectedModeSettingsCapability = "ignoreProtectedModeSettings";
        private const string IgnoreZoomSettingCapability = "ignoreZoomSetting";
        private const string InitialBrowserUrlCapability = "initialBrowserUrl";
        private const string EnableNativeEventsCapability = "nativeEvents";
        private const string EnablePersistentHoverCapability = "enablePersistentHover";
        private const string ElementScrollBehaviorCapability = "elementScrollBehavior";
        private const string UnexpectedAlertBehaviorCapability = "unexpectedAlertBehaviour";
        private const string RequireWindowFocusCapability = "requireWindowFocus";
        private const string BrowserAttachTimeoutCapability = "browserAttachTimeout";

        private bool ignoreProtectedModeSettings;
        private bool ignoreZoomLevel;
        private bool enableNativeEvents = true;
        private bool requireWindowFocus;
        private bool enablePersistentHover = true;
        private TimeSpan browserAttachTimeout = TimeSpan.MinValue;
        private string initialBrowserUrl = string.Empty;
        private InternetExplorerElementScrollBehavior elementScrollBehavior = InternetExplorerElementScrollBehavior.Top;
        private InternetExplorerUnexpectedAlertBehavior unexpectedAlertBehavior = InternetExplorerUnexpectedAlertBehavior.Default;
        private Dictionary<string, object> additionalCapabilities = new Dictionary<string, object>();

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
        /// Provides a means to add additional capabilities not yet added as type safe options 
        /// for the Internet Explorer driver.
        /// </summary>
        /// <param name="capabilityName">The name of the capability to add.</param>
        /// <param name="capabilityValue">The value of the capability to add.</param>
        /// <exception cref="ArgumentException">
        /// thrown when attempting to add a capability for which there is already a type safe option, or 
        /// when <paramref name="capabilityName"/> is <see langword="null"/> or the empty string.
        /// </exception>
        /// <remarks>Calling <see cref="AddAdditionalCapability"/> where <paramref name="capabilityName"/>
        /// has already been added will overwrite the existing value with the new value in <paramref name="capabilityValue"/></remarks>
        public void AddAdditionalCapability(string capabilityName, object capabilityValue)
        {
            if (capabilityName == IgnoreProtectedModeSettingsCapability ||
                capabilityName == IgnoreZoomSettingCapability ||
                capabilityName == EnableNativeEventsCapability ||
                capabilityName == InitialBrowserUrlCapability ||
                capabilityName == ElementScrollBehaviorCapability ||
                capabilityName == UnexpectedAlertBehaviorCapability ||
                capabilityName == EnablePersistentHoverCapability ||
                capabilityName == RequireWindowFocusCapability ||
                capabilityName == BrowserAttachTimeoutCapability)
            {
                string message = string.Format(CultureInfo.InvariantCulture, "There is already an option for the {0} capability. Please use that instead.", capabilityName);
                throw new ArgumentException(message, "capabilityName");
            }

            if (string.IsNullOrEmpty(capabilityName))
            {
                throw new ArgumentException("Capability name may not be null an empty string.", "capabilityName");
            }

            this.additionalCapabilities[capabilityName] = capabilityValue;
        }

        /// <summary>
        /// Returns DesiredCapabilities for IE with these options included as
        /// capabilities. This copies the options. Further changes will not be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The DesiredCapabilities for IE with these options.</returns>
        public ICapabilities ToCapabilities()
        {
            DesiredCapabilities capabilities = DesiredCapabilities.InternetExplorer();
            capabilities.SetCapability(EnableNativeEventsCapability, this.enableNativeEvents);
            capabilities.SetCapability(EnablePersistentHoverCapability, this.enablePersistentHover);

            if (this.requireWindowFocus)
            {
                capabilities.SetCapability(RequireWindowFocusCapability, true);
            }

            if (this.ignoreProtectedModeSettings)
            {
                capabilities.SetCapability(IgnoreProtectedModeSettingsCapability, true);
            }

            if (this.ignoreZoomLevel)
            {
                capabilities.SetCapability(IgnoreZoomSettingCapability, true);
            }

            if (!string.IsNullOrEmpty(this.initialBrowserUrl))
            {
                capabilities.SetCapability(InitialBrowserUrlCapability, this.initialBrowserUrl);
            }

            if (this.elementScrollBehavior == InternetExplorerElementScrollBehavior.Bottom)
            {
                capabilities.SetCapability(ElementScrollBehaviorCapability, 1);
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

                capabilities.SetCapability(UnexpectedAlertBehaviorCapability, unexpectedAlertBehaviorSetting);
            }

            if (this.browserAttachTimeout != TimeSpan.MinValue)
            {
                capabilities.SetCapability(BrowserAttachTimeoutCapability, Convert.ToInt32(this.browserAttachTimeout.TotalMilliseconds));
            }

            foreach (KeyValuePair<string, object> pair in this.additionalCapabilities)
            {
                capabilities.SetCapability(pair.Key, pair.Value);
            }

            return capabilities;
        }
    }
}
