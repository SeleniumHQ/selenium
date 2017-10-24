// <copyright file="DriverOptions.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Base class for managing options specific to a browser driver.
    /// </summary>
    public abstract class DriverOptions
    {
        private Dictionary<string, LogLevel> loggingPreferences = new Dictionary<string, LogLevel>();

        /// <summary>
        /// Provides a means to add additional capabilities not yet added as type safe options
        /// for the specific browser driver.
        /// </summary>
        /// <param name="capabilityName">The name of the capability to add.</param>
        /// <param name="capabilityValue">The value of the capability to add.</param>
        /// <exception cref="ArgumentException">
        /// thrown when attempting to add a capability for which there is already a type safe option, or
        /// when <paramref name="capabilityName"/> is <see langword="null"/> or the empty string.
        /// </exception>
        /// <remarks>Calling <see cref="AddAdditionalCapability(string, object)"/>
        /// where <paramref name="capabilityName"/> has already been added will overwrite the
        /// existing value with the new value in <paramref name="capabilityValue"/>.
        /// </remarks>
        public abstract void AddAdditionalCapability(string capabilityName, object capabilityValue);

        /// <summary>
        /// Returns DesiredCapabilities for the specific browser driver with these
        /// options included ascapabilities. This does not copy the options. Further
        /// changes will be reflected in the returned capabilities.
        /// </summary>
        /// <returns>The DesiredCapabilities for browser driver with these options.</returns>
        public abstract ICapabilities ToCapabilities();

        /// <summary>
        /// Sets the logging preferences for this driver.
        /// </summary>
        /// <param name="logType">The type of log for which to set the preference.
        /// Known log types can be found in the <see cref="LogType"/> class.</param>
        /// <param name="logLevel">The <see cref="LogLevel"/> value to which to set the log level.</param>
        public void SetLoggingPreference(string logType, LogLevel logLevel)
        {
            this.loggingPreferences[logType] = logLevel;
        }

        /// <summary>
        /// Generates the logging preferences dictionary for transmission as a desired capability.
        /// </summary>
        /// <returns>The dictionary containing the logging preferences.</returns>
        protected Dictionary<string, object> GenerateLoggingPreferencesDictionary()
        {
            if (this.loggingPreferences.Count == 0)
            {
                return null;
            }

            Dictionary<string, object> loggingPreferenceCapability = new Dictionary<string, object>();
            foreach (string logType in this.loggingPreferences.Keys)
            {
                loggingPreferenceCapability[logType] = this.loggingPreferences[logType].ToString().ToUpperInvariant();
            }

            return loggingPreferenceCapability;
        }
    }
}
