// <copyright file="AppCacheStatus.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Html5
{
    /// <summary>
    /// Represents the application cache status.
    /// </summary>
    public enum AppCacheStatus
    {
        /// <summary>
        /// AppCache status is uncached
        /// </summary>
        Uncached = 0,

        /// <summary>
        /// AppCache status is idle
        /// </summary>
        Idle = 1,

        /// <summary>
        /// AppCache status is checkint
        /// </summary>
        Checking,

        /// <summary>
        /// AppCache status is downloading
        /// </summary>
        Downloading,

        /// <summary>
        /// AppCache status is updated-ready
        /// </summary>
        UpdateReady,

        /// <summary>
        /// AppCache status is obsolete
        /// </summary>
        Obsolete
    }
}
