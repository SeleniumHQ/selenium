// <copyright file="FirefoxOptions.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Class to manage options specific to <see cref="FirefoxDriver"/>
    /// </summary>
    /// <remarks>
    /// Used with the marionette executable wires.exe.
    /// </remarks>
    /// <example>
    /// <code>
    /// FirefoxOptions options = new FirefoxOptions();
    /// </code>
    /// <para></para>
    /// <para>For use with FirefoxDriver:</para>
    /// <para></para>
    /// <code>
    /// FirefoxDriver driver = new FirefoxDriver(options);
    /// </code>
    /// <para></para>
    /// <para>For use with RemoteWebDriver:</para>
    /// <para></para>
    /// <code>
    /// RemoteWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/wd/hub"), options.ToCapabilities());
    /// </code>
    /// </example>
    public class FirefoxOptions : DriverOptions
    {
        private bool isMarionette = true;

        /// <summary>
        /// Gets or sets a value indicating whether or not to use the Mozilla-provided Marionette implementation.
        /// </summary>
        public bool IsMarionette
        {
            get { return this.isMarionette; }
            set { this.isMarionette = value; }
        }

        /// <summary>
        /// Provides a means to add additional capabilities not yet added as type safe options
        /// for the Firefox driver.
        /// </summary>
        /// <param name="capabilityName">The name of the capability to add.</param>
        /// <param name="capabilityValue">The value of the capability to add.</param>
        /// <exception cref="ArgumentException">
        /// thrown when attempting to add a capability for which there is already a type safe option, or
        /// when <paramref name="capabilityName"/> is <see langword="null"/> or the empty string.
        /// </exception>
        /// <remarks>For the moment, this method has no effect for the Firefox driver, as use
        /// of the FirefoxOptions class is only used as a marker for Marionette. This will
        /// change in the future.</remarks>
        public override void AddAdditionalCapability(string capabilityName, object capabilityValue)
        {
        }

        /// <summary>
        /// Returns DesiredCapabilities for Firefox with these options included as
        /// capabilities. This does not copy the options. Further changes will be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The DesiredCapabilities for Firefox with these options.</returns>
        public override ICapabilities ToCapabilities()
        {
            DesiredCapabilities capabilities = DesiredCapabilities.Firefox();
            capabilities.SetCapability("marionette", this.isMarionette);
            return capabilities;
        }
    }
}
