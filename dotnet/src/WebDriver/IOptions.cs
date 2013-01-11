// <copyright file="IOptions.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines an interface allowing the user to set options on the browser.
    /// </summary>
    public interface IOptions
    {
        /// <summary>
        /// Gets an object allowing the user to manipulate cookies on the page.
        /// </summary>
        ICookieJar Cookies { get; }

        /// <summary>
        /// Gets an object allowing the user to manipulate the currently-focused browser window.
        /// </summary>
        /// <remarks>"Currently-focused" is defined as the browser window having the window handle
        /// returned when IWebDriver.CurrentWindowHandle is called.</remarks>
        IWindow Window { get; }

        /// <summary>
        /// Provides access to the timeouts defined for this driver.
        /// </summary>
        /// <returns>An object implementing the <see cref="ITimeouts"/> interface.</returns>
        ITimeouts Timeouts();
    }
}
