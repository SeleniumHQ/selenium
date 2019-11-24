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
using OpenQA.Selenium.Chromium;

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
    public class EdgeOptions : ChromiumOptions
    {
        private const string BrowserNameValue = "MicrosoftEdge";
        private const string UseInPrivateBrowsingCapability = "ms:inPrivate";
        private const string ExtensionPathsCapability = "ms:extensionPaths";
        private const string StartPageCapability = "ms:startPage";

        private static readonly string[] ChromiumCapabilityNames = { "goog:chromeOptions", "se:forceAlwaysMatch", "args",
            "binary", "extensions", "localState", "prefs", "detach", "debuggerAddress", "excludeSwitches", "minidumpPath",
            "mobileEmulation", "perfLoggingPrefs", "windowTypes", "w3c"};

        private bool useInPrivateBrowsing;
        private string startPage;
        private List<string> extensionPaths = new List<string>();
        private bool isLegacy;

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeOptions"/> class.
        /// </summary>
        public EdgeOptions() : this(true)
        {
        }

        /// <summary>
        /// Create an EdgeOption for ChromiumEdge
        /// </summary>
        /// <param name="isLegacy">Whether to use Legacy Mode. If so, remove all Chromium Capabilities</param>
        public EdgeOptions(bool isLegacy) : base(BrowserNameValue)
        {
            this.isLegacy = isLegacy;

            if (this.isLegacy)
            {
                foreach (string capabilityName in ChromiumCapabilityNames)
                {
                    this.RemoveKnownCapabilityName(capabilityName);
                }

                this.AddKnownCapabilityName(UseInPrivateBrowsingCapability, "UseInPrivateBrowsing property");
                this.AddKnownCapabilityName(StartPageCapability, "StartPage property");
                this.AddKnownCapabilityName(ExtensionPathsCapability, "AddExtensionPaths method");
            }
        }

        /// <summary>
        /// Gets or sets the location of the Edge browser's binary executable file.
        /// </summary>
        public new string BinaryLocation
        {
            get
            {
                if (this.isLegacy)
                {
                    throw new ArgumentException("BinaryLocation does not exist in Legacy Edge");
                }

                return base.BinaryLocation;
            }
            set
            {
                if (this.isLegacy)
                {
                    throw new ArgumentException("BinaryLocation does not exist in Legacy Edge");
                }

                base.BinaryLocation = value;
            }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the browser should be launched using
        /// InPrivate browsing.
        /// </summary>
        public bool UseInPrivateBrowsing
        {
            get
            {
                if (!this.isLegacy)
                {
                    throw new ArgumentException("UseInPrivateBrowsing property does not exist in Chromium Edge");
                }

                return this.useInPrivateBrowsing;
            }
            set
            {
                if (!this.isLegacy)
                {
                    throw new ArgumentException("UseInPrivateBrowsing property does not exist in Chromium Edge");
                }

                this.useInPrivateBrowsing = value;
            }
        }

        /// <summary>
        /// Gets or sets the URL of the page with which the browser will be navigated to on launch.
        /// </summary>
        public string StartPage
        {
            get
            {
                if (!this.isLegacy)
                {
                    throw new ArgumentException("StartPage property does not exist in Chromium Edge");
                }

                return this.startPage;
            }
            set
            {
                if (!this.isLegacy)
                {
                    throw new ArgumentException("StartPage property does not exist in Chromium Edge");
                }

                this.startPage = value;
            }
        }


        /// <summary>
        /// Adds a path to an extension that is to be used with the Edge driver.
        /// </summary>
        /// <param name="extensionPath">The full path and file name of the extension.</param>
        public void AddExtensionPath(string extensionPath)
        {
            if (!this.isLegacy)
            {
                throw new ArgumentException("Property does not exist in Chromium Edge", "extensionPath");
            }

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
            if (!this.isLegacy)
            {
                throw new ArgumentException("Property does not exist in Chromium Edge", "extensionPathsToAdd");
            }

            this.AddExtensionPaths(new List<string>(extensionPathsToAdd));
        }

        /// <summary>
        /// Adds a list of paths to an extensions that are to be used with the Edge driver.
        /// </summary>
        /// <param name="extensionPathsToAdd">An <see cref="IEnumerable{T}"/> of full paths with file names of extensions to add.</param>
        public void AddExtensionPaths(IEnumerable<string> extensionPathsToAdd)
        {
            if (!this.isLegacy)
            {
                throw new ArgumentException("Property does not exist in Chromium Edge", "extensionPathsToAdd");
            }

            if (extensionPathsToAdd == null)
            {
                throw new ArgumentNullException("extensionPathsToAdd", "extensionPathsToAdd must not be null");
            }

            this.extensionPaths.AddRange(extensionPathsToAdd);
        }

        /// <summary>
        /// Returns DesiredCapabilities for Edge with these options included as
        /// capabilities. This copies the options. Further changes will not be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The DesiredCapabilities for Edge with these options.</returns>
        public override ICapabilities ToCapabilities()
        {
            if (!this.isLegacy)
            {
                return base.ToCapabilities();
            }

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
