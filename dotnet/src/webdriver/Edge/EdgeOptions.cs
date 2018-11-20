// <copyright file="EdgeOptions.cs" company="Microsoft">
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

namespace OpenQA.Selenium.Edge
{
    /// <summary>
    /// Class to manage options specific to <see cref="EdgeDriver"/>
    /// </summary>
    /// <example>
    /// <code>
    /// EdgeOptions options = new EdgeOptions();
    /// </code>
    /// <para></para>
    /// <para>For use with EdgeDriver:</para>
    /// <para></para>
    /// <code>
    /// EdgeDriver driver = new EdgeDriver(options);
    /// </code>
    /// <para></para>
    /// <para>For use with RemoteWebDriver:</para>
    /// <para></para>
    /// <code>
    /// RemoteWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/wd/hub"), options.ToCapabilities());
    /// </code>
    /// </example>
    public class EdgeOptions : DriverOptions
    {
        private const string BrowserNameValue = "MicrosoftEdge";
        private const string UseInPrivateBrowsingCapability = "ms:inPrivate";
        private const string ExtensionPathsCapability = "ms:extensionPaths";
        private const string StartPageCapability = "ms:startPage";

        private bool useInPrivateBrowsing;
        private string startPage;
        private List<string> extensionPaths = new List<string>();

        public EdgeOptions() : base()
        {
            this.BrowserName = BrowserNameValue;
            this.AddKnownCapabilityName(UseInPrivateBrowsingCapability, "UseInPrivateBrowsing property");
            this.AddKnownCapabilityName(StartPageCapability, "StartPage property");
            this.AddKnownCapabilityName(ExtensionPathsCapability, "AddExtensionPaths method");
        }

        /// <summary>
        /// Gets or sets a value indicating whether the browser should be launched using
        /// InPrivate browsing.
        /// </summary>
        public bool UseInPrivateBrowsing
        {
            get { return this.useInPrivateBrowsing; }
            set { this.useInPrivateBrowsing = value; }
        }

        /// <summary>
        /// Gets or sets the URL of the page with which the browser will be navigated to on launch.
        /// </summary>
        public string StartPage
        {
            get { return this.startPage; }
            set { this.startPage = value; }
        }


        /// <summary>
        /// Adds a path to an extension that is to be used with the Edge driver.
        /// </summary>
        /// <param name="extensionPath">The full path and file name of the extension.</param>
        public void AddExtensionPath(string extensionPath)
        {
            if (string.IsNullOrEmpty(extensionPath))
            {
                throw new ArgumentException("extensionPath must not be null or empty", "extensionPath");
            }

            this.AddExtensionPaths(extensionPath);
        }

        /// <summary>
        /// Adds a list of paths to an extensions that are to be used with the Edge driver.
        /// </summary>
        /// <param name="extensionPathsToAdd">An array of full paths with file names of extensions to add.</param>
        public void AddExtensionPaths(params string[] extensionPathsToAdd)
        {
            this.AddExtensionPaths(new List<string>(extensionPathsToAdd));
        }

        /// <summary>
        /// Adds a list of paths to an extensions that are to be used with the Edge driver.
        /// </summary>
        /// <param name="extensionPathsToAdd">An <see cref="IEnumerable{T}"/> of full paths with file names of extensions to add.</param>
        public void AddExtensionPaths(IEnumerable<string> extensionPathsToAdd)
        {
            if (extensionPathsToAdd == null)
            {
                throw new ArgumentNullException("extensionPathsToAdd", "extensionPathsToAdd must not be null");
            }

            this.extensionPaths.AddRange(extensionPathsToAdd);
        }

        /// <summary>
        /// Provides a means to add additional capabilities not yet added as type safe options
        /// for the Edge driver.
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
        /// Returns DesiredCapabilities for Edge with these options included as
        /// capabilities. This copies the options. Further changes will not be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The DesiredCapabilities for Edge with these options.</returns>
        public override ICapabilities ToCapabilities()
        {
            IWritableCapabilities capabilities = this.GenerateDesiredCapabilities(true);

            if (this.useInPrivateBrowsing)
            {
                capabilities.SetCapability(UseInPrivateBrowsingCapability, true);
            }

            if (!string.IsNullOrEmpty(this.startPage))
            {
                capabilities.SetCapability(StartPageCapability, this.startPage);
            }

            if (this.extensionPaths.Count > 0)
            {
                capabilities.SetCapability(ExtensionPathsCapability, this.extensionPaths);
            }

            return capabilities.AsReadOnly();
        }
    }
}
