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
    /// used with Edge Chromium.
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

        private const string EdgeOptionsCapabilityName = "edgeOptions";

        private bool useWebView;

        /// <summary>
        /// Initializes a new instance of the <see cref="EdgeOptions"/> class.
        /// </summary>
        public EdgeOptions() : base()
        {
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
        /// Gets or sets whether to create a WebView session used for launching an Edge (Chromium) WebView-based app on desktop.
        /// </summary>
        public bool UseWebView
        {
            get { return this.useWebView; }
            set { this.useWebView = value; }
        }
    }
}
