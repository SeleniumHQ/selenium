// <copyright file="LogLevel.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents the levels of logging available to driver instances.
    /// </summary>
    public enum LogLevel
    {
        /// <summary>
        /// Show all log messages.
        /// </summary>
        All,

        /// <summary>
        /// Show messages with information useful for debugging.
        /// </summary>
        Debug,

        /// <summary>
        /// Show informational messages.
        /// </summary>
        Info,

        /// <summary>
        /// Show messages corresponding to non-critical issues.
        /// </summary>
        Warning,

        /// <summary>
        /// Show messages corresponding to critical issues.
        /// </summary>
        Severe,

        /// <summary>
        /// Show no log messages.
        /// </summary>
        Off
    }
}
