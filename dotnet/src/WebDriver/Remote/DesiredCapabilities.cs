// <copyright file="DesiredCapabilities.cs" company="WebDriver Committers">
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
using System.Globalization;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Class to Create the capabilities of the browser you require for <see cref="IWebDriver"/>. 
    /// If you wish to use default values use the static methods
    /// </summary>
    public class DesiredCapabilities : ICapabilities
    {
        private readonly Dictionary<string, object> capabilities = new Dictionary<string, object>();

        /// <summary>
        /// Initializes a new instance of the DesiredCapabilities class
        /// </summary>
        /// <param name="browser">Name of the browser e.g. firefox, internet explorer, safari</param>
        /// <param name="version">Version of the browser</param>
        /// <param name="platform">The platform it works on</param>
        public DesiredCapabilities(string browser, string version, Platform platform)
        {
            this.SetCapability(CapabilityType.BrowserName, browser);
            this.SetCapability(CapabilityType.Version, version);
            this.SetCapability(CapabilityType.Platform, platform);
        }

        /// <summary>
        /// Initializes a new instance of the DesiredCapabilities class
        /// </summary>
        public DesiredCapabilities()
        {
        }

        /// <summary>
        /// Initializes a new instance of the DesiredCapabilities class
        /// </summary>
        /// <param name="rawMap">Dictionary of items for the remote driver</param>
        /// <example>
        /// <code>
        /// DesiredCapabilities capabilities = new DesiredCapabilities(new Dictionary<![CDATA[<string,object>]]>(){["browserName","firefox"],["version",string.Empty],["javaScript",true]});
        /// </code>
        /// </example>
        public DesiredCapabilities(Dictionary<string, object> rawMap)
        {
            if (rawMap != null)
            {
                foreach (string key in rawMap.Keys)
                {
                    if (key == CapabilityType.Platform)
                    {
                        object raw = rawMap[CapabilityType.Platform];
                        string rawAsString = raw as string;
                        Platform rawAsPlatform = raw as Platform;
                        if (rawAsString != null)
                        {
                            PlatformType platformInfo = PlatformType.Any;
                            try
                            {
                                platformInfo = (PlatformType)Enum.Parse(typeof(PlatformType), rawAsString, true);
                            }
                            catch (ArgumentException)
                            {
                                // If the server does not pass back a valid platform type, ignore it and
                                // use PlatformType.Any.
                            }

                            this.capabilities[CapabilityType.Platform] = new Platform(platformInfo);
                        }
                        else if (rawAsPlatform != null)
                        {
                            this.SetCapability(CapabilityType.Platform, rawAsPlatform);
                        }
                    }
                    else
                    {
                        this.SetCapability(key, rawMap[key]);
                    }
                }
            }
        }

        /// <summary>
        /// Gets the browser name 
        /// </summary>
        public string BrowserName
        {
            get 
            {
                string name = string.Empty;
                object capabilityValue = this.GetCapability(CapabilityType.BrowserName);
                if (capabilityValue != null)
                {
                    name = capabilityValue.ToString();
                }

                return name;
            }
        }

        /// <summary>
        /// Gets or sets the platform
        /// </summary>
        public Platform Platform
        {
            get 
            {
                return this.GetCapability(CapabilityType.Platform) as Platform ?? new Platform(PlatformType.Any);
            }
            
            set
            {
                this.SetCapability(CapabilityType.Platform, value);
            }
        }

        /// <summary>
        /// Gets the browser version
        /// </summary>
        public string Version
        {
            get 
            {
                string browserVersion = string.Empty;
                object capabilityValue = this.GetCapability(CapabilityType.Version);
                if (capabilityValue != null)
                {
                    browserVersion = capabilityValue.ToString();
                }

                return browserVersion;
            }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the browser is JavaScript enabled
        /// </summary>
        public bool IsJavaScriptEnabled
        {
            get 
            {
                bool javascriptEnabled = false;
                object capabilityValue = this.GetCapability(CapabilityType.IsJavaScriptEnabled);
                if (capabilityValue != null)
                {
                    javascriptEnabled = (bool)capabilityValue;
                }

                return javascriptEnabled;
            }

            set 
            {
                this.SetCapability(CapabilityType.IsJavaScriptEnabled, value);
            }
        }

        /// <summary>
        /// Gets the internal capabilities dictionary.
        /// </summary>
        internal Dictionary<string, object> Capabilities
        {
            get { return this.capabilities; }
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Firefox</returns>
        public static DesiredCapabilities Firefox()
        {
            return new DesiredCapabilities("firefox", string.Empty, new Platform(PlatformType.Any));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Firefox</returns>
        public static DesiredCapabilities PhantomJS()
        {
            return new DesiredCapabilities("phantomjs", string.Empty, new Platform(PlatformType.Any));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Internet Explorer</returns>
        public static DesiredCapabilities InternetExplorer()
        {
            return new DesiredCapabilities("internet explorer", string.Empty, new Platform(PlatformType.Windows));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with HTMLUnit</returns>
        public static DesiredCapabilities HtmlUnit()
        {
            return new DesiredCapabilities("htmlunit", string.Empty, new Platform(PlatformType.Any));
        }
        
        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with HTMLUnit with JS</returns>
        public static DesiredCapabilities HtmlUnitWithJavaScript()
        {
            return new DesiredCapabilities("htmlunit", "firefox", new Platform(PlatformType.Any));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with iPhone</returns>
        public static DesiredCapabilities IPhone()
        {
            return new DesiredCapabilities("iPhone", string.Empty, new Platform(PlatformType.Mac));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with iPad</returns>
        public static DesiredCapabilities IPad()
        {
            return new DesiredCapabilities("iPad", string.Empty, new Platform(PlatformType.Mac));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Chrome</returns>
        public static DesiredCapabilities Chrome()
        {
            // This is strangely inconsistent.
            DesiredCapabilities dc = new DesiredCapabilities("chrome", string.Empty, new Platform(PlatformType.Windows));
            dc.IsJavaScriptEnabled = true;
            return dc;
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Android</returns>
        public static DesiredCapabilities Android()
        {
            return new DesiredCapabilities("android", string.Empty, new Platform(PlatformType.Android));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Opera</returns>
        public static DesiredCapabilities Opera()
        {
            return new DesiredCapabilities("opera", string.Empty, new Platform(PlatformType.Any));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Safari</returns>
        public static ICapabilities Safari()
        {
            return new DesiredCapabilities("safari", string.Empty, new Platform(PlatformType.Any));
        }

        /// <summary>
        /// Gets a value indicating whether the browser has a given capability.
        /// </summary>
        /// <param name="capability">The capability to get.</param>
        /// <returns>Returns <see langword="true"/> if the browser has the capability; otherwise, <see langword="false"/>.</returns>
        public bool HasCapability(string capability)
        {
            return this.capabilities.ContainsKey(capability);
        }

        /// <summary>
        /// Gets a capability of the browser.
        /// </summary>
        /// <param name="capability">The capability to get.</param>
        /// <returns>An object associated with the capability, or <see langword="null"/>
        /// if the capability is not set on the browser.</returns>
        public object GetCapability(string capability)
        {
            object capabilityValue = null;
            if (this.capabilities.ContainsKey(capability))
            {
                capabilityValue = this.capabilities[capability];
            }

            return capabilityValue;
        }

        /// <summary>
        /// Sets a capability of the browser.
        /// </summary>
        /// <param name="capability">The capability to get.</param>
        /// <param name="capabilityValue">The value for the capability.</param>
        public void SetCapability(string capability, object capabilityValue)
        {
            this.capabilities[capability] = capabilityValue;
        }

        /// <summary>
        /// Return HashCode for the DesiredCapabilities that has been created
        /// </summary>
        /// <returns>Integer of HashCode generated</returns>
        public override int GetHashCode()
        {
            int result;
            result = this.BrowserName != null ? this.BrowserName.GetHashCode() : 0;
            result = (31 * result) + (this.Version != null ? this.Version.GetHashCode() : 0);
            result = (31 * result) + (this.Platform != null ? this.Platform.GetHashCode() : 0);
            result = (31 * result) + (this.IsJavaScriptEnabled ? 1 : 0);
            return result;
        }

        /// <summary>
        /// Return a string of capabilities being used
        /// </summary>
        /// <returns>String of capabilities being used</returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "Capabilities [BrowserName={0}, IsJavaScriptEnabled={1}, Platform={2}, Version={3}]", this.BrowserName, this.IsJavaScriptEnabled, this.Platform.PlatformType.ToString(), this.Version);
        }

        /// <summary>
        /// Compare two DesiredCapabilities and will return either true or false
        /// </summary>
        /// <param name="obj">DesiredCapabilities you wish to compare</param>
        /// <returns>true if they are the same or false if they are not</returns>
        public override bool Equals(object obj)
        {
            if (this == obj)
            {
                return true;
            }

            DesiredCapabilities other = obj as DesiredCapabilities;
            if (other == null)
            {
                return false;
            }

            if (this.IsJavaScriptEnabled != other.IsJavaScriptEnabled)
            {
                return false;
            }

            if (this.BrowserName != null ? this.BrowserName != other.BrowserName : other.BrowserName != null)
            {
                return false;
            }

            if (!this.Platform.IsPlatformType(other.Platform.PlatformType))
            {
                return false;
            }

            if (this.Version != null ? this.Version != other.Version : other.Version != null)
            {
                return false;
            }

            return true;
        }
    }
}
