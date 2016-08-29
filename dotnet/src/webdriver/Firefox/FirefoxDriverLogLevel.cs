// <copyright file="FirefoxDriverLogLevel.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Represents the valid values of logging levels available with the Firefox driver (geckodriver.exe).
    /// </summary>
    public enum FirefoxDriverLogLevel
    {
        /// <summary>
        /// Represents the Trace value, the most detailed logging level available.
        /// </summary>
        Trace,

        /// <summary>
        /// Represents the Debug value
        /// </summary>
        Debug,

        /// <summary>
        /// Represents the Config value
        /// </summary>
        Config,

        /// <summary>
        /// Represents the Info value
        /// </summary>
        Info,

        /// <summary>
        /// Represents the Warn value
        /// </summary>
        Warn,

        /// <summary>
        /// Represents the Error value
        /// </summary>
        Error,

        /// <summary>
        /// Represents the Fatal value, the least detailed logging level available.
        /// </summary>
        Fatal
    }
}
