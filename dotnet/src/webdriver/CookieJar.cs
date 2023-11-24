// <copyright file="CookieJar.cs" company="WebDriver Committers">
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
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines an interface allowing the user to manipulate cookies on the current page.
    /// </summary>
    internal class CookieJar : ICookieJar
    {
        private WebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="CookieJar"/> class.
        /// </summary>
        /// <param name="driver">The driver that is currently in use</param>
        public CookieJar(WebDriver driver)
        {
            this.driver = driver;
        }

        /// <summary>
        /// Gets all cookies defined for the current page.
        /// </summary>
        public ReadOnlyCollection<Cookie> AllCookies
        {
            get { return this.GetAllCookies(); }
        }

        /// <summary>
        /// Method for creating a cookie in the browser
        /// </summary>
        /// <param name="cookie"><see cref="Cookie"/> that represents a cookie in the browser</param>
        public void AddCookie(Cookie cookie)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("cookie", cookie);
            this.driver.InternalExecute(DriverCommand.AddCookie, parameters);
        }

        /// <summary>
        /// Delete the cookie by passing in the name of the cookie
        /// </summary>
        /// <param name="name">The name of the cookie that is in the browser</param>
        public void DeleteCookieNamed(string name)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("name", name);
            this.driver.InternalExecute(DriverCommand.DeleteCookie, parameters);
        }

        /// <summary>
        /// Delete a cookie in the browser by passing in a copy of a cookie
        /// </summary>
        /// <param name="cookie">An object that represents a copy of the cookie that needs to be deleted</param>
        public void DeleteCookie(Cookie cookie)
        {
            if (cookie != null)
            {
                this.DeleteCookieNamed(cookie.Name);
            }
        }

        /// <summary>
        /// Delete All Cookies that are present in the browser
        /// </summary>
        public void DeleteAllCookies()
        {
            this.driver.InternalExecute(DriverCommand.DeleteAllCookies, null);
        }

        /// <summary>
        /// Method for returning a getting a cookie by name
        /// </summary>
        /// <param name="name">name of the cookie that needs to be returned</param>
        /// <returns>A Cookie from the name</returns>
        public Cookie GetCookieNamed(string name)
        {
            Cookie cookieToReturn = null;
            if (name != null)
            {
                ReadOnlyCollection<Cookie> allCookies = this.AllCookies;
                foreach (Cookie currentCookie in allCookies)
                {
                    if (name.Equals(currentCookie.Name))
                    {
                        cookieToReturn = currentCookie;
                        break;
                    }
                }
            }

            return cookieToReturn;
        }

        /// <summary>
        /// Method for getting a Collection of Cookies that are present in the browser
        /// </summary>
        /// <returns>ReadOnlyCollection of Cookies in the browser</returns>
        private ReadOnlyCollection<Cookie> GetAllCookies()
        {
            List<Cookie> toReturn = new List<Cookie>();
            object returned = this.driver.InternalExecute(DriverCommand.GetAllCookies, new Dictionary<string, object>()).Value;

            try
            {
                object[] cookies = returned as object[];
                if (cookies != null)
                {
                    foreach (object rawCookie in cookies)
                    {
                        Dictionary<string, object> cookieDictionary = rawCookie as Dictionary<string, object>;
                        if (rawCookie != null)
                        {
                            toReturn.Add(Cookie.FromDictionary(cookieDictionary));
                        }
                    }
                }

                return new ReadOnlyCollection<Cookie>(toReturn);
            }
            catch (Exception e)
            {
                throw new WebDriverException("Unexpected problem getting cookies", e);
            }
        }
    }
}
