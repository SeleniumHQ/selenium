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
using System.Globalization;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents a cookie in the browser.
    /// </summary>
    public class Cookie
    {
        private string cookieName;
        private string cookieValue;
        private string cookiePath;
        private string cookieDomain;
        private DateTime? cookieExpiry;

        /// <summary>
        /// Initializes a new instance of the <see cref="Cookie"/> class with a specific name, 
        /// value, domain, path and expiration date.
        /// </summary>
        /// <param name="name">The name of the cookie.</param>
        /// <param name="value">The value of the cookie.</param>
        /// <param name="domain">The domain of the cookie.</param>
        /// <param name="path">The path of the cookie.</param>
        /// <param name="expiry">The expiration date of the cookie.</param>
        /// <exception cref="ArgumentException">If the name is <see langword="null"/> or an empty string,
        /// or if it contains a semi-colon.</exception>
        /// <exception cref="ArgumentNullException">If the value is <see langword="null"/>.</exception>
        public Cookie(string name, string value, string domain, string path, DateTime? expiry)
        {
            if (string.IsNullOrEmpty(name))
            {
                throw new ArgumentException("Cookie name cannot be null or empty string", "name");
            }

            if (value == null)
            {
                throw new ArgumentNullException("value", "Cookie value cannot be null");
            }

            if (name.IndexOf(';') != -1)
            {
                throw new ArgumentException("Cookie names cannot contain a ';': " + name, "name");
            }

            this.cookieName = name;
            this.cookieValue = value;
            if (!string.IsNullOrEmpty(path))
            {
                this.cookiePath = path;
            }
            else
            {
                this.cookiePath = "/";
            }

            this.cookieDomain = domain;
            if (expiry != null)
            {
                this.cookieExpiry = expiry;
            }
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Cookie"/> class with a specific name, 
        /// value, path and expiration date.
        /// </summary>
        /// <param name="name">The name of the cookie.</param>
        /// <param name="value">The value of the cookie.</param>
        /// <param name="path">The path of the cookie.</param>
        /// <param name="expiry">The expiration date of the cookie.</param>
        /// <exception cref="ArgumentException">If the name is <see langword="null"/> or an empty string,
        /// or if it contains a semi-colon.</exception>
        /// <exception cref="ArgumentNullException">If the value is <see langword="null"/>.</exception>
        public Cookie(string name, string value, string path, DateTime? expiry)
            : this(name, value, null, path, expiry)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Cookie"/> class with a specific name, 
        /// value, and path.
        /// </summary>
        /// <param name="name">The name of the cookie.</param>
        /// <param name="value">The value of the cookie.</param>
        /// <param name="path">The path of the cookie.</param>
        /// <exception cref="ArgumentException">If the name is <see langword="null"/> or an empty string,
        /// or if it contains a semi-colon.</exception>
        /// <exception cref="ArgumentNullException">If the value is <see langword="null"/>.</exception>
        public Cookie(string name, string value, string path)
            : this(name, value, path, null)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Cookie"/> class with a specific name and value.
        /// </summary>
        /// <param name="name">The name of the cookie.</param>
        /// <param name="value">The value of the cookie.</param>
        /// <exception cref="ArgumentException">If the name is <see langword="null"/> or an empty string,
        /// or if it contains a semi-colon.</exception>
        /// <exception cref="ArgumentNullException">If the value is <see langword="null"/>.</exception>
        public Cookie(string name, string value)
            : this(name, value, "/", null)
        {
        }

        /// <summary>
        /// Gets the name of the cookie.
        /// </summary>
        public string Name
        {
            get { return cookieName; }
        }

        /// <summary>
        /// Gets the value of the cookie.
        /// </summary>
        public string Value
        {
            get { return cookieValue; }
        }

        /// <summary>
        /// Gets the domain of the cookie.
        /// </summary>
        public string Domain
        {
            get { return cookieDomain; }
        }

        /// <summary>
        /// Gets the path of the cookie.
        /// </summary>
        public virtual string Path
        {
            get { return cookiePath; }
        }

        /// <summary>
        /// Gets a value indicating whether the cookie is secure.
        /// </summary>
        public virtual bool Secure
        {
            get { return false; }
        }

        /// <summary>
        /// Gets the expiration date of the cookie.
        /// </summary>
        public DateTime? Expiry
        {
            get { return cookieExpiry; }
        }

        /// <summary>
        /// Creates and returns a string representation of the cookie. 
        /// </summary>
        /// <returns>A string representation of the cookie.</returns>
        public override string ToString()
        {
            return cookieName + "=" + cookieValue
                + (cookieExpiry == null ? string.Empty : "; expires=" + cookieExpiry.Value.ToUniversalTime().ToString("ddd MM/dd/yyyy hh:mm:ss UTC", CultureInfo.InvariantCulture))
                    + (string.IsNullOrEmpty(cookiePath) ? string.Empty : "; path=" + cookiePath)
                    + (string.IsNullOrEmpty(cookieDomain) ? string.Empty : "; domain=" + cookieDomain);
            ////                + (isSecure ? ";secure;" : "");
        }

        /// <summary>
        /// Determines whether the specified <see cref="System.Object">Object</see> is equal 
        /// to the current <see cref="System.Object">Object</see>.
        /// </summary>
        /// <param name="obj">The <see cref="System.Object">Object</see> to compare with the 
        /// current <see cref="System.Object">Object</see>.</param>
        /// <returns><see langword="true"/> if the specified <see cref="System.Object">Object</see>
        /// is equal to the current <see cref="System.Object">Object</see>; otherwise,
        /// <see langword="false"/>.</returns>
        public override bool Equals(object obj)
        {
            // Two cookies are equal if the name and value match
            Cookie cookie = obj as Cookie;

            if (this == obj)
            {
                return true;
            }

            if (cookie == null)
            {
                return false;
            }

            if (!cookieName.Equals(cookie.cookieName))
            {
                return false;
            }

            return !(cookieValue != null ? !cookieValue.Equals(cookie.cookieValue) : cookie.Value != null);
        }

        /// <summary>
        /// Serves as a hash function for a particular type.
        /// </summary>
        /// <returns>A hash code for the current <see cref="System.Object">Object</see>.</returns>
        public override int GetHashCode()
        {
            return cookieName.GetHashCode();
        }
    }
}
