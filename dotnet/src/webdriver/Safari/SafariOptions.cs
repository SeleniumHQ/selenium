// <copyright file="SafariOptions.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Safari
{
    /// <summary>
    /// Class to manage options specific to <see cref="SafariDriver"/>
    /// </summary>
    /// <example>
    /// <code>
    /// SafariOptions options = new SafariOptions();
    /// options.SkipExtensionInstallation = true;
    /// </code>
    /// <para></para>
    /// <para>For use with SafariDriver:</para>
    /// <para></para>
    /// <code>
    /// SafariDriver driver = new SafariDriver(options);
    /// </code>
    /// <para></para>
    /// <para>For use with RemoteWebDriver:</para>
    /// <para></para>
    /// <code>
    /// RemoteWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/wd/hub"), options.ToCapabilities());
    /// </code>
    /// </example>
    public class SafariOptions : DriverOptions
    {
        private const string BrowserNameValue = "safari";
        private const string EnableAutomaticInspectionSafariOption = "safari:automaticInspection";
        private const string EnableAutomticProfilingSafariOption = "safari:automaticProfiling";

        private bool enableAutomaticInspection = false;
        private bool enableAutomaticProfiling = false;

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariOptions"/> class.
        /// </summary>
        public SafariOptions() : base()
        {
            this.BrowserName = BrowserNameValue;
            this.AddKnownCapabilityName(SafariOptions.EnableAutomaticInspectionSafariOption, "EnableAutomaticInspection property");
            this.AddKnownCapabilityName(SafariOptions.EnableAutomticProfilingSafariOption, "EnableAutomaticProfiling property");
        }

        /// <summary>
        /// Gets or sets a value indicating whether to have the driver preload the
        /// Web Inspector and JavaScript debugger in the background.
        /// </summary>
        public bool EnableAutomaticInspection
        {
            get { return this.enableAutomaticInspection; }
            set { this.enableAutomaticInspection = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to have the driver preload the
        /// Web Inspector and start a timeline recording in the background.
        /// </summary>
        public bool EnableAutomaticProfiling
        {
            get { return this.enableAutomaticProfiling; }
            set { this.enableAutomaticProfiling = value; }
        }

        /// <summary>
        /// Provides a means to add additional capabilities not yet added as type safe options
        /// for the Safari driver.
        /// </summary>
        /// <param name="capabilityName">The name of the capability to add.</param>
        /// <param name="capabilityValue">The value of the capability to add.</param>
        /// <exception cref="ArgumentException">
        /// thrown when attempting to add a capability for which there is already a type safe option, or
        /// when <paramref name="capabilityName"/> is <see langword="null"/> or the empty string.
        /// </exception>
        /// <remarks>Calling <see cref="AddAdditionalCapability"/> where <paramref name="capabilityName"/>
        /// has already been added will overwrite the existing value with the new value in <paramref name="capabilityValue"/></remarks>
        [Obsolete("Use the temporary AddAdditionalOption method for adding additional options")]
        public override void AddAdditionalCapability(string capabilityName, object capabilityValue)
        {
            this.AddAdditionalOption(capabilityName, capabilityValue);
        }

        /// <summary>
        /// Returns ICapabilities for Safari with these options included as
        /// capabilities. This copies the options. Further changes will not be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The ICapabilities for Safari with these options.</returns>
        public override ICapabilities ToCapabilities()
        {
            IWritableCapabilities capabilities = this.GenerateDesiredCapabilities(true);
            if (this.enableAutomaticInspection)
            {
                capabilities.SetCapability(EnableAutomaticInspectionSafariOption, true);
            }

            if (this.enableAutomaticProfiling)
            {
                capabilities.SetCapability(EnableAutomticProfilingSafariOption, true);
            }

            return capabilities.AsReadOnly();
        }
    }
}
