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
    /// Specifies the behavior of waiting for page loads in the Edge driver.
    /// </summary>
    public enum EdgePageLoadStrategy
    {
        /// <summary>
        /// Indicates the behavior is not set.
        /// </summary>
        Default,

        /// <summary>
        /// Waits for pages to load and ready state to be 'complete'.
        /// </summary>
        Normal,

        /// <summary>
        /// Waits for pages to load and for ready state to be 'interactive' or 'complete'.
        /// </summary>
        Eager,

        /// <summary>
        /// Does not wait for pages to load, returning immediately.
        /// </summary>
        None
    }

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
        private EdgePageLoadStrategy pageLoadStrategy = EdgePageLoadStrategy.Default;
        private Dictionary<string, object> additionalCapabilities = new Dictionary<string, object>();

        /// <summary>
        /// Gets or sets the value for describing how the browser is to wait for pages to load in the Edge driver.
        /// Defaults to <see cref="EdgePageLoadStrategy.Default"/>.
        /// </summary>
        public EdgePageLoadStrategy PageLoadStrategy
        {
            get { return this.pageLoadStrategy; }
            set { this.pageLoadStrategy = value; }
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
        public override void AddAdditionalCapability(string capabilityName, object capabilityValue)
        {
            if (capabilityName == CapabilityType.PageLoadStrategy)
            {
                string message = string.Format(CultureInfo.InvariantCulture, "There is already an option for the {0} capability. Please use that instead.", capabilityName);
                throw new ArgumentException(message, "capabilityName");
            }

            if (string.IsNullOrEmpty(capabilityName))
            {
                throw new ArgumentException("Capability name may not be null an empty string.", "capabilityName");
            }

            this.additionalCapabilities[capabilityName] = capabilityValue;
        }

        /// <summary>
        /// Returns DesiredCapabilities for Edge with these options included as
        /// capabilities. This copies the options. Further changes will not be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The DesiredCapabilities for Edge with these options.</returns>
        public override ICapabilities ToCapabilities()
        {
            DesiredCapabilities capabilities = new DesiredCapabilities("MicrosoftEdge", string.Empty, new Platform(PlatformType.Windows), false);
            if (this.pageLoadStrategy != EdgePageLoadStrategy.Default)
            {
                string pageLoadStrategySetting = "normal";
                switch (this.pageLoadStrategy)
                {
                    case EdgePageLoadStrategy.Eager:
                        pageLoadStrategySetting = "eager";
                        break;

                    case EdgePageLoadStrategy.None:
                        pageLoadStrategySetting = "none";
                        break;
                }

                capabilities.SetCapability(CapabilityType.PageLoadStrategy, pageLoadStrategySetting);
            }

            foreach (KeyValuePair<string, object> pair in this.additionalCapabilities)
            {
                capabilities.SetCapability(pair.Key, pair.Value);
            }

            return capabilities;
        }
    }
}
