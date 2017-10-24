// <copyright file="PhantomJSOptions.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.PhantomJS
{
    /// <summary>
    /// Class to manage options specific to <see cref="PhantomJSDriver"/>
    /// </summary>
    /// <example>
    /// <code>
    /// PhantomJSOptions options = new PhantomJSOptions();
    /// </code>
    /// <para></para>
    /// <para>For use with PhantomJSDriver:</para>
    /// <para></para>
    /// <code>
    /// PhantomJSDriver driver = new PhantomJSDriver(options);
    /// </code>
    /// <para></para>
    /// <para>For use with RemoteWebDriver:</para>
    /// <para></para>
    /// <code>
    /// RemoteWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/wd/hub"), options.ToCapabilities());
    /// </code>
    /// </example>
    public class PhantomJSOptions : DriverOptions
    {
        private Dictionary<string, object> additionalCapabilities = new Dictionary<string, object>();

        /// <summary>
        /// Provides a means to add additional capabilities not yet added as type safe options
        /// for the PhantomJS driver.
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
            if (string.IsNullOrEmpty(capabilityName))
            {
                throw new ArgumentException("Capability name may not be null an empty string.", "capabilityName");
            }

            this.additionalCapabilities[capabilityName] = capabilityValue;
        }

        /// <summary>
        /// Returns DesiredCapabilities for PhantomJS with these options included as
        /// capabilities. This copies the options. Further changes will not be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The DesiredCapabilities for PhantomJS with these options.</returns>
        public override ICapabilities ToCapabilities()
        {
            DesiredCapabilities capabilities = new DesiredCapabilities("phantomjs", string.Empty, new Platform(PlatformType.Any), false);

            foreach (KeyValuePair<string, object> pair in this.additionalCapabilities)
            {
                capabilities.SetCapability(pair.Key, pair.Value);
            }

            return capabilities;
        }
    }
}
