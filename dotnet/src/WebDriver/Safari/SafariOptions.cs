// <copyright file="SafariOptions.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Safari
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using OpenQA.Selenium.Remote;

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
    public class SafariOptions
    {
        private int port;
        private bool skipExtensionInstallation;
        private string customExtensionPath;
        private string safariLocation = string.Empty;
        private Dictionary<string, object> additionalCapabilities = new Dictionary<string, object>();

        /// <summary>
        /// Initializes a new instance of the <see cref="SafariOptions"/> class.
        /// </summary>
        public SafariOptions()
        {
        }

        /// <summary>
        /// Gets or sets the install location of the Safari browser.
        /// </summary>
        public string SafariLocation
        {
            get { return this.safariLocation; }
            set { this.safariLocation = value; }
        }

        /// <summary>
        /// Gets or sets the port on which the SafariDriver will listen for commands.
        /// </summary>
        public int Port
        {
            get { return this.port; }
            set { this.port = value; }
        }

        /// <summary>
        /// Gets or sets the path to the SafariDriver.safariextz file from which the extension will be installed.
        /// </summary>
        public string CustomExtensionPath
        {
            get { return this.customExtensionPath; }
            set { this.customExtensionPath = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to skip the installation of the SafariDriver extension.
        /// </summary>
        /// <remarks>
        /// Set this property to <see langword="true"/> if the SafariDriver extension is already installed 
        /// in Safari, and you don't want to overwrite it with the version included with WebDriver.
        /// </remarks>
        public bool SkipExtensionInstallation
        {
            get { return this.skipExtensionInstallation; }
            set { this.skipExtensionInstallation = value; }
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
        public void AddAdditionalCapability(string capabilityName, object capabilityValue)
        {
            if (string.IsNullOrEmpty(capabilityName))
            {
                throw new ArgumentException("Capability name may not be null an empty string.", "capabilityName");
            }

            this.additionalCapabilities[capabilityName] = capabilityValue;
        }

        /// <summary>
        /// Returns ICapabilities for Safari with these options included as
        /// capabilities. This copies the options. Further changes will not be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The ICapabilities for Safari with these options.</returns>
        public ICapabilities ToCapabilities()
        {
            DesiredCapabilities capabilities = DesiredCapabilities.Safari();
            foreach (KeyValuePair<string, object> pair in this.additionalCapabilities)
            {
                capabilities.SetCapability(pair.Key, pair.Value);
            }

            return capabilities;
        }
    }
}
