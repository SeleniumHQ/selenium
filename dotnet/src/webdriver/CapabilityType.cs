// <copyright file="CapabilityType.cs" company="WebDriver Committers">
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

using System.Collections.Generic;

namespace OpenQA.Selenium
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
        /// Capability name used for the browser version.
        /// </summary>
        public static readonly string BrowserVersion = "browserVersion";

        /// <summary>
        /// Capability name used for the platform name.
        /// </summary>
        public static readonly string PlatformName = "platformName";

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
        /// Capability name used to indicate whether the browser accepts SSL certificates on W3C Endpoints
        /// </summary>
        public static readonly string AcceptInsecureCertificates = "acceptInsecureCerts";

        /// <summary>
        /// Capability name used to indicate whether the browser uses native events.
        /// </summary>
        public static readonly string HasNativeEvents = "nativeEvents";

        /// <summary>
        /// Capability name used to indicate how the browser handles unexpected alerts.
        /// </summary>
        public static readonly string UnexpectedAlertBehavior = "unexpectedAlertBehaviour";

        /// <summary>
        /// Capability name used to indicate how the browser handles unhandled user prompts.
        /// </summary>
        public static readonly string UnhandledPromptBehavior = "unhandledPromptBehavior";

        /// <summary>
        /// Capability name used to indicate the page load strategy for the browser.
        /// </summary>
        public static readonly string PageLoadStrategy = "pageLoadStrategy";

        /// <summary>
        /// Capability name used to indicate the logging preferences for the session.
        /// </summary>
        public static readonly string LoggingPreferences = "loggingPrefs";

        /// <summary>
        /// Capability name used to disable the check for overlapping elements.
        /// </summary>
        public static readonly string DisableOverlappedElementCheck = "overlappingCheckDisabled";

        /// <summary>
        /// Capability name used to enable the profiling log for the session.
        /// </summary>
        public static readonly string EnableProfiling = "webdriver.logging.profiler.enabled";

        /// <summary>
        /// Capability name used to indicate whether the driver supports geolocation context.
        /// </summary>
        public static readonly string SupportsLocationContext = "locationContextEnabled";

        /// <summary>
        /// Capability name used to indicate whether the driver supports application cache.
        /// </summary>
        public static readonly string SupportsApplicationCache = "applicationCacheEnabled";

        /// <summary>
        /// Capability name used to indicate whether the driver supports web storage.
        /// </summary>
        public static readonly string SupportsWebStorage = "webStorageEnabled";

        /// <summary>
        /// Capability name used to indicate whether the driver supports setting the browser window's size and position.
        /// </summary>
        public static readonly string SetWindowRect = "setWindowRect";
        
        /// <summary>
        /// Capability name used to get or set timeout values when creating a session.
        /// </summary>
        public static readonly string Timeouts = "timeouts";

        /// <summary>
        /// Capability name used to get or set whether &lt;input type='file'/&gt; elements must be visible to upload files.
        /// </summary>
        public static readonly string UseStrictFileInteractability = "strictFileInteractability";

        /// <summary>
        /// Capability name used to get a value indicating whether to request URL of a WebSocket
        /// connection for bidirectional communication with a driver.
        /// </summary>
        public static readonly string WebSocketUrl = "webSocketUrl";

        private static readonly List<string> KnownSpecCompliantCapabilityNames = new List<string>() {
            BrowserName,
            BrowserVersion,
            PlatformName,
            AcceptInsecureCertificates,
            PageLoadStrategy,
            Proxy,
            SetWindowRect,
            Timeouts,
            UnhandledPromptBehavior,
            UseStrictFileInteractability,
            WebSocketUrl
        };

        /// <summary>
        /// Gets a value indicating whether a given capability name is compliant with the
        /// W3C WebDriver Specification.
        /// </summary>
        /// <param name="capabilityName">The name of the capability to check for compliance.</param>
        /// <returns><see langword="true"/> if the capability name is valid according to the rules
        /// of the specification; otherwise, <see langword="false"/>.</returns>
        public static bool IsSpecCompliantCapabilityName(string capabilityName)
        {
            if (KnownSpecCompliantCapabilityNames.Contains(capabilityName) || capabilityName.Contains(":"))
            {
                return true;
            }

            return false;
        }
    }
}
