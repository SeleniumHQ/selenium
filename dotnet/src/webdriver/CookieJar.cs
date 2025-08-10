// <copyright file="CookieJar.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium;

internal sealed class CookieJar(WebDriver driver) : ICookieJar
{
    /// <summary>
    /// Gets all cookies defined for the current page.
    /// </summary>
    public ReadOnlyCollection<Cookie> AllCookies
    {
        get
        {
            Response response = driver.Execute(DriverCommand.GetAllCookies, new Dictionary<string, object>());

            List<Cookie> toReturn = new List<Cookie>();
            if (response.Value is object?[] cookies)
            {
                foreach (object? rawCookie in cookies)
                {
                    if (rawCookie != null)
                    {
                        Cookie newCookie = Cookie.FromDictionary((Dictionary<string, object?>)rawCookie);
                        toReturn.Add(newCookie);
                    }
                }
            }

            return new ReadOnlyCollection<Cookie>(toReturn);
        }
    }

    /// <summary>
    /// Method for creating a cookie in the browser
    /// </summary>
    /// <param name="cookie"><see cref="Cookie"/> that represents a cookie in the browser</param>
    /// <exception cref="ArgumentNullException">If <paramref name="cookie"/> is <see langword="null"/>.</exception>
    public void AddCookie(Cookie cookie)
    {
        if (cookie is null)
        {
            throw new ArgumentNullException(nameof(cookie));
        }

        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("cookie", cookie);
        driver.Execute(DriverCommand.AddCookie, parameters);
    }

    /// <summary>
    /// Delete the cookie by passing in the name of the cookie
    /// </summary>
    /// <param name="name">The name of the cookie that is in the browser</param>
    /// <exception cref="ArgumentException">If <paramref name="name"/> is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public void DeleteCookieNamed(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Cookie name cannot be null or empty", nameof(name));
        }

        Dictionary<string, object> parameters = new() { { "name", name } };

        driver.Execute(DriverCommand.DeleteCookie, parameters);
    }

    /// <summary>
    /// Delete a cookie in the browser by passing in a copy of a cookie
    /// </summary>
    /// <param name="cookie">An object that represents a copy of the cookie that needs to be deleted</param>
    /// <exception cref="ArgumentNullException">If <paramref name="cookie"/> is <see langword="null"/>.</exception>
    public void DeleteCookie(Cookie cookie)
    {
        if (cookie is null)
        {
            throw new ArgumentNullException(nameof(cookie));
        }

        this.DeleteCookieNamed(cookie.Name);
    }

    /// <summary>
    /// Delete All Cookies that are present in the browser
    /// </summary>
    public void DeleteAllCookies()
    {
        driver.Execute(DriverCommand.DeleteAllCookies, null);
    }

    /// <summary>
    /// Method for returning a getting a cookie by name
    /// </summary>
    /// <param name="name">name of the cookie that needs to be returned</param>
    /// <returns>A Cookie from the name; or <see langword="null"/> if not found.</returns>
    /// <exception cref="ArgumentException">If <paramref name="name"/> is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public Cookie? GetCookieNamed(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Cookie name cannot be null or empty", nameof(name));
        }

        try
        {
            var rawCookie = driver.Execute(DriverCommand.GetCookie, new() { { "name", name } }).Value;

            return Cookie.FromDictionary((Dictionary<string, object?>)rawCookie!);
        }
        catch (NoSuchCookieException)
        {
            return null;
        }
    }
}
