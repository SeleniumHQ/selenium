// <copyright file="ChromeOptions.cs" company="WebDriver Committers">
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
using System.Collections.ObjectModel;
using System.Globalization;
using System.IO;
using OpenQA.Selenium.Chromium;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Class to manage options specific to <see cref="ChromeDriver"/>
    /// </summary>
    /// <remarks>
    /// Used with ChromeDriver.exe v17.0.963.0 and higher.
    /// </remarks>
    /// <example>
    /// <code>
    /// ChromeOptions options = new ChromeOptions();
    /// options.AddExtensions("\path\to\extension.crx");
    /// options.BinaryLocation = "\path\to\chrome";
    /// </code>
    /// <para></para>
    /// <para>For use with ChromeDriver:</para>
    /// <para></para>
    /// <code>
    /// ChromeDriver driver = new ChromeDriver(options);
    /// </code>
    /// <para></para>
    /// <para>For use with RemoteWebDriver:</para>
    /// <para></para>
    /// <code>
    /// RemoteWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/wd/hub"), options.ToCapabilities());
    /// </code>
    /// </example>
    public class ChromeOptions : ChromiumOptions
    {
        private const string ChromeOptionsCapabilityName = "chromeOptions";
        private const string BrowserNameValue = "chrome";

        /// <summary>
        /// Initializes a new instance of the <see cref="ChromeOptions"/> class.
        /// </summary>
        public ChromeOptions() : base()
        {
            this.BrowserName = BrowserNameValue;
        }

        /// <summary>
        /// Gets the vendor prefix to apply to Chromium-specific capability names.
        /// </summary>
        protected override string VendorPrefix
        {
            get { return "goog"; }
        }

        /// <summary>
        /// Gets the name of the capability used to store Chromium options in
        /// an <see cref="ICapabilities"/> object.
        /// </summary>
        public override string CapabilityName
        {
            get { return string.Format(CultureInfo.InvariantCulture, "{0}:{1}", this.VendorPrefix, ChromeOptionsCapabilityName); }
        }

        /// <summary>
        /// Provides a means to add additional capabilities not yet added as type safe options
        /// for the Chrome driver.
        /// </summary>
        /// <param name="optionName">The name of the capability to add.</param>
        /// <param name="optionValue">The value of the capability to add.</param>
        /// <exception cref="ArgumentException">
        /// thrown when attempting to add a capability for which there is already a type safe option, or
        /// when <paramref name="optionName"/> is <see langword="null"/> or the empty string.
        /// </exception>
        /// <remarks>Calling <see cref="AddAdditionalChromeOption(string, object)"/>
        /// where <paramref name="optionName"/> has already been added will overwrite the
        /// existing value with the new value in <paramref name="optionValue"/>.
        /// Calling this method adds capabilities to the Chrome-specific options object passed to
        /// webdriver executable (property name 'goog:chromeOptions').</remarks>
        public void AddAdditionalChromeOption(string optionName, object optionValue)
        {
            this.AddAdditionalChromiumOption(optionName, optionValue);
        }
    }
}
