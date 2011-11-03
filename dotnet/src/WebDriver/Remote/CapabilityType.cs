// <copyright file="CapabilityType.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides types of capabilities for the DesiredCapabilities object.
    /// </summary>
    public static class CapabilityType
    {
        /// <summary>
        /// Capability name used for the browser name.
        /// </summary>
        public static readonly string BrowserName = "browserName";

        /// <summary>
        /// Capability name used for the browser platform.
        /// </summary>
        public static readonly string Platform = "platform";

        /// <summary>
        /// Capability name used for the browser version.
        /// </summary>
        public static readonly string Version = "version";

        /// <summary>
        /// Capability name used to indicate whether JavaScript is enabled for the browser.
        /// </summary>
        public static readonly string IsJavaScriptEnabled = "javascriptEnabled";

        /// <summary>
        /// Capability name used to indicate whether the browser can take screenshots.
        /// </summary>
        public static readonly string TakesScreenshot = "takesScreenshot";

        /// <summary>
        /// Capability name used to indicate whether the browser can handle alerts.
        /// </summary>
        public static readonly string HandlesAlerts = "handlesAlerts";

        /// <summary>
        /// Capability name used to indicate whether the browser can find elements via CSS selectors.
        /// </summary>
        public static readonly string SupportsFindingByCss = "cssSelectorsEnabled";

        /// <summary>
        /// Capability name used for the browser proxy.
        /// </summary>
        public static readonly string Proxy = "proxy";

        /// <summary>
        /// Capability name used to indicate whether the browser supports rotation.
        /// </summary>
        public static readonly string Rotatable = "rotatable";

        /// <summary>
        /// Capability name used to indicate whether the browser accepts SSL certificates.
        /// </summary>
        public static readonly string AcceptSslCertificates = "acceptSslCerts";

        /// <summary>
        /// Capability name used to indicate whether the browser uses native events.
        /// </summary>
        public static readonly string HasNativeEvents = "nativeEvents";
    }
}
