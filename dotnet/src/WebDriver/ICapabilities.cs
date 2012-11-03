// <copyright file="ICapabilities.cs" company="WebDriver Committers">
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
    /// Capabilities of the browser that you are going to use
    /// </summary>
    public interface ICapabilities
    {
        /// <summary>
        /// Gets the browser name
        /// </summary>
        string BrowserName { get; }

        /// <summary>
        /// Gets the platform
        /// </summary>
        Platform Platform { get; }

        /// <summary>
        /// Gets the browser version
        /// </summary>
        string Version { get; }

        /// <summary>
        /// Gets a value indicating whether the browser is JavaScript enabled
        /// </summary>
        bool IsJavaScriptEnabled { get; }

        /// <summary>
        /// Gets a value indicating whether the browser has a given capability.
        /// </summary>
        /// <param name="capability">The capability to get.</param>
        /// <returns>Returns <see langword="true"/> if the browser has the capability; otherwise, <see langword="false"/>.</returns>
        bool HasCapability(string capability);

        /// <summary>
        /// Gets a capability of the browser.
        /// </summary>
        /// <param name="capability">The capability to get.</param>
        /// <returns>An object associated with the capability, or <see langword="null"/>
        /// if the capability is not set on the browser.</returns>
        object GetCapability(string capability);
    }
}
