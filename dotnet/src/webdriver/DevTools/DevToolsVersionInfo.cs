// <copyright file="DevToolsVersionInfo.cs" company="WebDriver Committers">
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
using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Provides information about the version of DevTools components being automated.
    /// </summary>
    public class DevToolsVersionInfo
    {
        /// <summary>
        /// Gets or sets the browser name, usually expressed as "Browser/Version" (e.g., "Chrome/86.0.0.1234".
        /// </summary>
        [JsonProperty(PropertyName = "Browser")]
        public string Browser { get; internal set; }

        /// <summary>
        /// Gets the browser version without the preceding browser name.
        /// </summary>
        [JsonIgnore]
        public string BrowserVersion => Regex.Match(Browser, ".*/(.*)").Groups[1].Value;

        /// <summary>
        /// Gets the browser major version number without the preceding browser name.
        /// </summary>
        [JsonIgnore]
        public string BrowserMajorVersion => Regex.Match(Browser, ".*/(\\d+)\\..*").Groups[1].Value;

        /// <summary>
        /// Gets the version of the Developer Tools Protocol.
        /// </summary>
        [JsonProperty(PropertyName = "Protocol-Version")]
        public string ProtocolVersion { get; internal set; }

        /// <summary>
        /// Gets the user agent string.
        /// </summary>
        [JsonProperty(PropertyName = "User-Agent")]
        public string UserAgent { get; internal set; }

        /// <summary>
        /// Gets the version string for the V8 script engine in use by this version of the browser.
        /// </summary>
        [JsonProperty(PropertyName = "V8-Version")]
        public string V8Version
        {
            get;
            internal set;
        }

        /// <summary>
        /// Gets the URL for the WebSocket connection used for communicating via the DevTools Protocol.
        /// </summary>
        [JsonProperty(PropertyName = "webSocketDebuggerUrl")]
        public string WebSocketDebuggerUrl { get; internal set; }

        /// <summary>
        /// Gets the version number of the V8 script engine, stripping values other than the version number.
        /// </summary>
        [JsonIgnore]
        public string V8VersionNumber
        {
            get
            {
                //Get the v8 version
                var v8VersionRegex = new Regex(@"^(\d+)\.(\d+)\.(\d+)(\.\d+.*)?");
                var v8VersionMatch = v8VersionRegex.Match(V8Version);
                if (v8VersionMatch.Success == false || v8VersionMatch.Groups.Count < 4)
                {
                    throw new InvalidOperationException($"Unable to determine v8 version number from v8 version string ({V8Version})");
                }

                return $"{v8VersionMatch.Groups[1].Value}.{v8VersionMatch.Groups[2].Value}.{v8VersionMatch.Groups[3].Value}";
            }
        }

        /// <summary>
        /// Gets the version string for the version of WebKit used to build this version of the browser.
        /// </summary>
        [JsonProperty(PropertyName = "WebKit-Version")]
        public string WebKitVersion { get; internal set; }

        /// <summary>
        /// Gets the hash of the version of WebKit, stripping values other than the hash.
        /// </summary>
        [JsonIgnore]
        public string WebKitVersionHash
        {
            get
            {
                //Get the webkit version hash.
                var webkitVersionRegex = new Regex(@"\s\(@(\b[0-9a-f]{5,40}\b)");
                var webkitVersionMatch = webkitVersionRegex.Match(WebKitVersion);
                if (webkitVersionMatch.Success == false || webkitVersionMatch.Groups.Count != 2)
                {
                    throw new InvalidOperationException($"Unable to determine webkit version hash from webkit version string ({WebKitVersion})");
                }

                return webkitVersionMatch.Groups[1].Value;
            }
        }
    }
}
