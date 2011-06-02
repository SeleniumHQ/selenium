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
        /// Gets an object allowing the user to manipulate cookies on the page.
        /// </summary>
        ICookieJar Cookies { get; }

        /// <summary>
        /// Adds a cookie to the current page.
        /// </summary>
        /// <param name="cookie">The <see cref="Cookie"/> object to be added.</param>
        [Obsolete("This method will be removed in a future release. Use the IOptions.Cookies.AddCookie() method instead.")]
        void AddCookie(Cookie cookie);

        /// <summary>
        /// Gets all cookies defined for the current page.
        /// </summary>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> of the cookies defined for the current page.</returns>
        [Obsolete("This method will be removed in a future release. Use the IOptions.Cookies.AllCookies property instead.")]
        ReadOnlyCollection<Cookie> GetCookies();

        /// <summary>
        /// Gets a cookie with the specified name.
        /// </summary>
        /// <param name="name">The name of the cookie to retrieve.</param>
        /// <returns>The <see cref="Cookie"/> containing the name. Returns <see langword="null"/>
        /// if no cookie with the specified name is found.</returns>
        [Obsolete("This method will be removed in a future release. Use the IOptions.Cookies.GetCookieNamed() method instead.")]
        Cookie GetCookieNamed(string name);

        /// <summary>
        /// Deletes the specified cookie from the page.
        /// </summary>
        /// <param name="cookie">The <see cref="Cookie"/> to be deleted.</param>
        [Obsolete("This method will be removed in a future release. Use the IOptions.Cookies.DeleteCookie() method instead.")]
        void DeleteCookie(Cookie cookie);

        /// <summary>
        /// Deletes the cookie with the specified name from the page.
        /// </summary>
        /// <param name="name">The name of the cookie to be deleted.</param>
        [Obsolete("This method will be removed in a future release. Use the IOptions.Cookies.DeleteCookieNamed() method instead.")]
        void DeleteCookieNamed(string name);

        /// <summary>
        /// Deletes all cookies from the page.
        /// </summary>
        [Obsolete("This method will be removed in a future release. Use the IOptions.Cookies.DeleteAllCookies() method instead.")]
        void DeleteAllCookies();

        /// <summary>
        /// Provides access to the timeouts defined for this driver.
        /// </summary>
        /// <returns>An object implementing the <see cref="ITimeouts"/> interface.</returns>
        ITimeouts Timeouts();
    }
}
