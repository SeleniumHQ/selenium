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
using System.Text;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.IE
{
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
        private const string InitialBrowserUrlCapability = "initialBrowserUrl";
        private const string EnableNativeEventsCapability = "nativeEvents";

        private bool ignoreProtectedModeSettings;
        private bool enableNativeEvents = true;
        private string initialBrowserUrl = string.Empty;

        /// <summary>
        /// Gets or sets a value indicating whether to ignore the settings of the Internet Explorer Protected Mode.
        /// </summary>
        public bool IntroduceInstabilityByIgnoringProtectedModeSettings
        {
            get { return this.ignoreProtectedModeSettings; }
            set { this.ignoreProtectedModeSettings = value; }
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
        /// Returns DesiredCapabiliites for IE with these options included as
        /// capabilities. This copies the options. Further changes will not be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The DesiredCapabilities for IE with these options.</returns>
        public ICapabilities ToCapabilities()
        {
            DesiredCapabilities capabilities = DesiredCapabilities.InternetExplorer();
            capabilities.SetCapability(EnableNativeEventsCapability, this.enableNativeEvents);
            if (this.ignoreProtectedModeSettings)
            {
                capabilities.SetCapability(IgnoreProtectedModeSettingsCapability, true);
            }

            if (!string.IsNullOrEmpty(this.initialBrowserUrl))
            {
                capabilities.SetCapability(InitialBrowserUrlCapability, this.initialBrowserUrl);
            }

            return capabilities;
        }
    }
}
