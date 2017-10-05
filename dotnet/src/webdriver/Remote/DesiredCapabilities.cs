// <copyright file="DesiredCapabilities.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Class to Create the capabilities of the browser you require for <see cref="IWebDriver"/>.
    /// If you wish to use default values use the static methods
    /// </summary>
    public class DesiredCapabilities : ICapabilities, ISpecificationCompliant
    {
        private readonly Dictionary<string, object> capabilities = new Dictionary<string, object>();
        private bool isSpecCompliant;

        /// <summary>
        /// Initializes a new instance of the <see cref="DesiredCapabilities"/> class
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
        /// Initializes a new instance of the <see cref="DesiredCapabilities"/> class
        /// </summary>
        public DesiredCapabilities()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DesiredCapabilities"/> class
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
                            this.SetCapability(CapabilityType.Platform, Platform.FromString(rawAsString));
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
        /// Initializes a new instance of the <see cref="DesiredCapabilities"/> class
        /// </summary>
        /// <param name="browser">Name of the browser e.g. firefox, internet explorer, safari</param>
        /// <param name="version">Version of the browser</param>
        /// <param name="platform">The platform it works on</param>
        /// <param name="isSpecCompliant">Sets a value indicating whether the capabilities are
        /// compliant with the W3C WebDriver specification.</param>
        internal DesiredCapabilities(string browser, string version, Platform platform, bool isSpecCompliant)
        {
            this.SetCapability(CapabilityType.BrowserName, browser);
            this.SetCapability(CapabilityType.Version, version);
            this.SetCapability(CapabilityType.Platform, platform);
            this.isSpecCompliant = isSpecCompliant;
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
        /// Gets or sets a value indicating whether the browser accepts SSL certificates.
        /// </summary>
        public bool AcceptInsecureCerts
        {
            get
            {
              bool acceptSSLCerts = false;
              object capabilityValue = this.GetCapability(CapabilityType.AcceptInsecureCertificates);
              if (capabilityValue != null)
              {
                acceptSSLCerts = (bool)capabilityValue;
              }

              return acceptSSLCerts;
            }

            set
            {
                this.SetCapability(CapabilityType.AcceptInsecureCertificates, value);
            }
        }

        /// <summary>
        /// Gets or sets a value indicating whether this set of capabilities is compliant with the W3C WebDriver specification.
        /// </summary>
        bool ISpecificationCompliant.IsSpecificationCompliant
        {
            get { return this.isSpecCompliant; }
            set { this.isSpecCompliant = value; }
        }

        /// <summary>
        /// Gets the internal capabilities dictionary.
        /// </summary>
        internal Dictionary<string, object> CapabilitiesDictionary
        {
            get { return this.capabilities; }
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Firefox</returns>
        [Obsolete("Use the FirefoxOptions class to set capabilities for use with Firefox. For use with the Java remote server or grid, use the ToCapabilites method of the FirefoxOptions class.")]
        public static DesiredCapabilities Firefox()
        {
            DesiredCapabilities dc = new DesiredCapabilities("firefox", string.Empty, new Platform(PlatformType.Any));
            dc.AcceptInsecureCerts = true;
            return dc;
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Firefox</returns>
        public static DesiredCapabilities PhantomJS()
        {
            DesiredCapabilities dc = new DesiredCapabilities("phantomjs", string.Empty, new Platform(PlatformType.Any));
            dc.isSpecCompliant = false;
            return dc;
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Internet Explorer</returns>
        [Obsolete("Use the InternetExplorerOptions class to set capabilities for use with Internet Explorer. For use with the Java remote server or grid, use the ToCapabilites method of the InternetExplorerOptions class.")]
        public static DesiredCapabilities InternetExplorer()
        {
            return new DesiredCapabilities("internet explorer", string.Empty, new Platform(PlatformType.Windows));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Microsoft Edge</returns>
        [Obsolete("Use the EdgeOptions class to set capabilities for use with Edge. For use with the Java remote server or grid, use the ToCapabilites method of the EdgeOptions class.")]
        public static DesiredCapabilities Edge()
        {
            DesiredCapabilities dc = new DesiredCapabilities("MicrosoftEdge", string.Empty, new Platform(PlatformType.Windows));
            dc.isSpecCompliant = false;
            return dc;
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with HTMLUnit</returns>
        public static DesiredCapabilities HtmlUnit()
        {
            DesiredCapabilities dc = new DesiredCapabilities("htmlunit", string.Empty, new Platform(PlatformType.Any));
            dc.isSpecCompliant = false;
            return dc;
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with HTMLUnit with JS</returns>
        public static DesiredCapabilities HtmlUnitWithJavaScript()
        {
            DesiredCapabilities dc = new DesiredCapabilities("htmlunit", string.Empty, new Platform(PlatformType.Any));
            dc.SetCapability(CapabilityType.IsJavaScriptEnabled, true);
            dc.isSpecCompliant = false;
            return dc;
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with iPhone</returns>
        [Obsolete("Selenium no longer provides an iOS device driver.")]
        public static DesiredCapabilities IPhone()
        {
            return new DesiredCapabilities("iPhone", string.Empty, new Platform(PlatformType.Mac));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with iPad</returns>
        [Obsolete("Selenium no longer provides an iOS device driver.")]
        public static DesiredCapabilities IPad()
        {
            return new DesiredCapabilities("iPad", string.Empty, new Platform(PlatformType.Mac));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Chrome</returns>
        [Obsolete("Use the ChromeOptions class to set capabilities for use with Chrome. For use with the Java remote server or grid, use the ToCapabilites method of the ChromeOptions class.")]
        public static DesiredCapabilities Chrome()
        {
            // This is strangely inconsistent.
            DesiredCapabilities dc = new DesiredCapabilities("chrome", string.Empty, new Platform(PlatformType.Any));
            dc.isSpecCompliant = false;
            return dc;
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Android</returns>
        [Obsolete("Selenium no longer provides an Android device driver.")]
        public static DesiredCapabilities Android()
        {
            return new DesiredCapabilities("android", string.Empty, new Platform(PlatformType.Android));
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Opera</returns>
        [Obsolete("Use the OperaOptions class to set capabilities for use with Opera. For use with the Java remote server or grid, use the ToCapabilites method of the OperaOptions class.")]
        public static DesiredCapabilities Opera()
        {
            DesiredCapabilities dc = new DesiredCapabilities("opera", string.Empty, new Platform(PlatformType.Any));
            dc.isSpecCompliant = false;
            return dc;
        }

        /// <summary>
        /// Method to return a new DesiredCapabilities using defaults
        /// </summary>
        /// <returns>New instance of DesiredCapabilities for use with Safari</returns>
        [Obsolete("Use the SafariOptions class to set capabilities for use with Safari. For use with the Java remote server or grid, use the ToCapabilites method of the SafariOptions class.")]
        public static DesiredCapabilities Safari()
        {
            DesiredCapabilities dc = new DesiredCapabilities("safari", string.Empty, new Platform(PlatformType.Mac));
            dc.isSpecCompliant = false;
            return dc;
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
                string capabilityValueString = capabilityValue as string;
                if (capability == CapabilityType.Platform && capabilityValueString != null)
                {
                    capabilityValue = Platform.FromString(capabilityValue.ToString());
                }
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
            // Handle the special case of Platform objects. These should
            // be stored in the underlying dictionary as their protocol
            // string representation.
            Platform platformCapabilityValue = capabilityValue as Platform;
            if (platformCapabilityValue != null)
            {
                this.capabilities[capability] = platformCapabilityValue.ProtocolPlatformType;
            }
            else
            {
                this.capabilities[capability] = capabilityValue;
            }
        }

        /// <summary>
        /// Converts the <see cref="ICapabilities"/> object to a <see cref="Dictionary{TKey, TValue}"/>.
        /// </summary>
        /// <returns>The <see cref="Dictionary{TKey, TValue}"/> containing the capabilities.</returns>
        public Dictionary<string, object> ToDictionary()
        {
            // CONSIDER: Instead of returning the raw internal member,
            // we might want to copy/clone it instead.
            return this.capabilities;
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
            return result;
        }

        /// <summary>
        /// Return a string of capabilities being used
        /// </summary>
        /// <returns>String of capabilities being used</returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "Capabilities [BrowserName={0}, Platform={1}, Version={2}]", this.BrowserName, this.Platform.PlatformType.ToString(), this.Version);
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
