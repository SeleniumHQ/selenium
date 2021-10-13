// <copyright file="ReturnedCookie.cs" company="WebDriver Committers">
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
using System.Globalization;

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Represents a cookie returned to the driver by the browser.
    /// </summary>
    public class ReturnedCookie : Cookie
    {
        
        /// <summary>
        /// Initializes a new instance of the <see cref="ReturnedCookie"/> class with a specific name,
        /// value, domain, path and expiration date.
        /// </summary>
        /// <param name="name">The name of the cookie.</param>
        /// <param name="value">The value of the cookie.</param>
        /// <param name="domain">The domain of the cookie.</param>
        /// <param name="path">The path of the cookie.</param>
        /// <param name="expiry">The expiration date of the cookie.</param>
        /// <param name="isSecure"><see langword="true"/> if the cookie is secure; otherwise <see langword="false"/></param>
        /// <param name="isHttpOnly"><see langword="true"/> if the cookie is an HTTP-only cookie; otherwise <see langword="false"/></param>
        /// <exception cref="ArgumentException">If the name is <see langword="null"/> or an empty string,
        /// or if it contains a semi-colon.</exception>
        /// <exception cref="ArgumentNullException">If the value or currentUrl is <see langword="null"/>.</exception>
        public ReturnedCookie(string name, string value, string domain, string path, DateTime? expiry, bool isSecure, bool isHttpOnly)
            : this(name, value, domain, path, expiry, isSecure, isHttpOnly, null)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ReturnedCookie"/> class with a specific name,
        /// value, domain, path and expiration date.
        /// </summary>
        /// <param name="name">The name of the cookie.</param>
        /// <param name="value">The value of the cookie.</param>
        /// <param name="domain">The domain of the cookie.</param>
        /// <param name="path">The path of the cookie.</param>
        /// <param name="expiry">The expiration date of the cookie.</param>
        /// <param name="isSecure"><see langword="true"/> if the cookie is secure; otherwise <see langword="false"/></param>
        /// <param name="isHttpOnly"><see langword="true"/> if the cookie is an HTTP-only cookie; otherwise <see langword="false"/></param>
        /// <param name="sameSite">The SameSite value of cookie.</param>
        /// <exception cref="ArgumentException">If the name is <see langword="null"/> or an empty string,
        /// or if it contains a semi-colon.</exception>
        /// <exception cref="ArgumentNullException">If the value or currentUrl is <see langword="null"/>.</exception>
        public ReturnedCookie(string name, string value, string domain, string path, DateTime? expiry, bool isSecure, bool isHttpOnly, string sameSite)
            : base(name, value, domain, path, expiry, isSecure, isHttpOnly, sameSite)
        {
          
        }

        /// <summary>
        /// Creates and returns a string representation of the current cookie.
        /// </summary>
        /// <returns>A string representation of the current cookie.</returns>
        public override string ToString()
        {
            return this.Name + "=" + this.Value
                + (this.Expiry == null ? string.Empty : "; expires=" + this.Expiry.Value.ToUniversalTime().ToString("ddd MM/dd/yyyy HH:mm:ss UTC", CultureInfo.InvariantCulture))
                    + (string.IsNullOrEmpty(this.Path) ? string.Empty : "; path=" + this.Path)
                    + (string.IsNullOrEmpty(this.Domain) ? string.Empty : "; domain=" + this.Domain)
                    + (this.Secure ? "; secure" : string.Empty)
                    + (this.IsHttpOnly ? "; httpOnly" : string.Empty)
                    + (string.IsNullOrEmpty(this.SameSite) ? string.Empty : "; sameSite=" + this.SameSite);
        }
    }
}
