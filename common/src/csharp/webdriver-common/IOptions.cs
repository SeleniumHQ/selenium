/* Copyright notice and license
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
        /// Gets or sets a value representing the speed with which user interactions 
        /// take place in the browser.
        /// </summary>
        Speed Speed { get; set; }

        /// <summary>
        /// Adds a cookie to the current page.
        /// </summary>
        /// <param name="cookie">The <see cref="Cookie"/> object to be added.</param>
        void AddCookie(Cookie cookie);

        /// <summary>
        /// Gets all cookies defined for the current page.
        /// </summary>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> of the cookies defined for the current page.</returns>
        ReadOnlyCollection<Cookie> GetCookies();

        /// <summary>
        /// Gets a cookie with the specified name.
        /// </summary>
        /// <param name="name">The name of the cookie to retrieve.</param>
        /// <returns>The <see cref="Cookie"/> containing the name. Returns <see langword="null"/>
        /// if no cookie with the specified name is found.</returns>
        Cookie GetCookieNamed(string name);

        /// <summary>
        /// Deletes the specified cookie from the page.
        /// </summary>
        /// <param name="cookie">The <see cref="Cookie"/> to be deleted.</param>
        void DeleteCookie(Cookie cookie);

        /// <summary>
        /// Deletes the cookie with the specified name from the page.
        /// </summary>
        /// <param name="name">The name of the cookie to be deleted.</param>
        void DeleteCookieNamed(string name);

        /// <summary>
        /// Deletes all cookies from the page.
        /// </summary>
        void DeleteAllCookies();

        /// <summary>
        /// Provides access to the timeouts defined for this driver.
        /// </summary>
        /// <returns>An object implementing the <see cref="ITimeouts"/> interface.</returns>
        ITimeouts Timeouts();
    }
}
