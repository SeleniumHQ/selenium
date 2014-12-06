// <copyright file="LoggingPreferences.cs" company="WebDriver Committers">
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

using System.Collections.Generic;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents the logging preferences.
    /// </summary>
    /// <code>
    /// DesiredCapabilities caps = DesiredCapabilities.Firefox();
    /// LoggingPreferences logs = new LoggingPreferences();
    /// logs.enable(LogType.Driver, Level.Info);
    /// caps.setCapability(CapabilityType.LOGGING_PREFS, logs);
    /// </code>
    public class LoggingPreferences
    {
        /// <summary>
        /// The prefs that are set
        /// </summary>
        internal readonly IDictionary<string, Level> prefs = new Dictionary<string, Level>();

        /// <summary>
        /// Enables the specified log type to be set.
        /// </summary>
        /// <param name="logTypeEnum">The log type.</param>
        /// <param name="level">The level to log.</param>
        public void Enable(LogTypeEnum logTypeEnum, Level level)
        {
            prefs.Add(new KeyValuePair<string, Level>(logTypeEnum.ToString().ToLower(), level));
        }
    }
}