// <copyright file="IDomains.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Interface providing version-independent implementations of operations available using the DevTools Protocol.
    /// </summary>
    public interface IDomains
    {
        /// <summary>
        /// Gets the version-specific domains for the DevTools session. This value must be cast to a version specific type to be at all useful.
        /// </summary>
        DevToolsSessionDomains VersionSpecificDomains { get; }

        /// <summary>
        /// Gets the object used for manipulating network information in the browser.
        /// </summary>
        INetwork Network { get; }

        /// <summary>
        /// Gets the object used for manipulating the browser's JavaScript execution.
        /// </summary>
        IJavaScript JavaScript { get; }

        /// <summary>
        /// Gets the object used for manipulating DevTools Protocol targets.
        /// </summary>
        ITarget Target { get; }

        /// <summary>
        /// Gets the object used for manipulating the browser's logs.
        /// </summary>
        ILog Log { get; }
    }
}
