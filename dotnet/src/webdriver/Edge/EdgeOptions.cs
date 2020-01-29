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
        private const string DefaultBrowserNameValue = "MicrosoftEdge";
        private const string WebViewBrowserNameValue = "WebView2";

        private const string UseInPrivateBrowsingCapability = "ms:inPrivate";
        private const string ExtensionPathsCapability = "ms:extensionPaths";
        private const string StartPageCapability = "ms:startPage";

        private const string EdgeOptionsCapabilityName = "edgeOptions";

        private bool useInPrivateBrowsing;
        private string startPage;
        private bool useWebView;
        private List<string> extensionPaths = new List<string>();

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeOptions"/> class.
        /// </summary>
        public EdgeOptions()
        {
            this.AddKnownCapabilityName(UseInPrivateBrowsingCapability, "UseInPrivateBrowsing property");
            this.AddKnownCapabilityName(StartPageCapability, "StartPage property");
            this.AddKnownCapabilityName(ExtensionPathsCapability, "AddExtensionPaths method");
        }

        /// <summary>
        /// Gets the default value of the browserName capability.
        /// </summary>
        protected override string BrowserNameValue
        {
            get { return UseWebView ? WebViewBrowserNameValue : DefaultBrowserNameValue; }
        }

        /// <summary>
        /// Gets the vendor prefix to apply to Chromium-specific capability names.
        /// </summary>
        protected override string VendorPrefix
        {
            get { return "ms"; }
        }

        /// <summary>
        /// Gets the name of the capability used to store Chromium options in
        /// an <see cref="ICapabilities"/> object.
        /// </summary>
        public override string CapabilityName
        {
            get { return string.Format(CultureInfo.InvariantCulture, "{0}:{1}", this.VendorPrefix, EdgeOptionsCapabilityName); }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the browser should be launched using
        /// InPrivate browsing.
        /// </summary>
        [Obsolete("UseInPrivateBrowsing is supported only in legacy Edge (EdgeHTML). For Edge (Chromium), launch with the '--inprivate' command line argument.")]
        public bool UseInPrivateBrowsing
        {
            get { return this.useInPrivateBrowsing; }
            set { this.useInPrivateBrowsing = value; }
        }

        /// <summary>
        /// Gets or sets the URL of the page with which the browser will be navigated to on launch.
        /// </summary>
        [Obsolete("StartPage is supported only in legacy Edge (EdgeHTML).")]
        public string StartPage
        {
            get { return this.startPage; }
            set { this.startPage = value; }
        }

        /// <summary>
        /// Gets or sets whether to create a WebView session used for launching an Edge (Chromium) WebView-based app on desktop.
        /// </summary>
        public bool UseWebView
        {
            get { return this.useWebView; }
            set { this.useWebView = value; }
        }

        /// <summary>
        /// Adds a path to an extension that is to be used with the Edge driver.
        /// </summary>
        /// <param name="extensionPath">The full path and file name of the extension.</param>
        [Obsolete("AddExtensionPath() is supported only in legacy Edge (EdgeHTML). For Edge (Chromium) use AddExtension().")]
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
        [Obsolete("AddExtensionPaths() is supported only in legacy Edge (EdgeHTML). For Edge (Chromium) use AddExtensions().")]
        public void AddExtensionPaths(params string[] extensionPathsToAdd)
        {
            this.AddExtensionPaths(new List<string>(extensionPathsToAdd));
        }

        /// <summary>
        /// Adds a list of paths to an extensions that are to be used with the Edge driver.
        /// </summary>
        /// <param name="extensionPathsToAdd">An <see cref="IEnumerable{T}"/> of full paths with file names of extensions to add.</param>
        [Obsolete("AddExtensionPaths() is supported only in legacy Edge (EdgeHTML). For Edge (Chromium) use AddExtensions().")]
        public void AddExtensionPaths(IEnumerable<string> extensionPathsToAdd)
        {
            if (extensionPathsToAdd == null)
            {
                throw new ArgumentNullException("extensionPathsToAdd", "extensionPathsToAdd must not be null");
            }

            this.extensionPaths.AddRange(extensionPathsToAdd);
        }

        protected override void AddVendorCapabilities(IWritableCapabilities capabilities)
        {
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
        }
    }
}
