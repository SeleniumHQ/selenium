// <copyright file="Cookie.cs" company="Selenium Committers">
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

using OpenQA.Selenium.Internal;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium;

/// <summary>
/// Represents a cookie in the browser.
/// </summary>
[Serializable]
public class Cookie
{
    private readonly string cookieName;
    private readonly string cookieValue;
    private readonly string? cookiePath;
    private readonly string? cookieDomain;
    private readonly string? sameSite;
    private readonly bool isHttpOnly;
    private readonly bool secure;
    private readonly DateTime? cookieExpiry;
    private readonly HashSet<string?> sameSiteValues = new HashSet<string?>()
    {
        "Strict",
        "Lax",
        "None"
    };

    /// <summary>
    /// Initializes a new instance of the <see cref="Cookie"/> class with a specific name and value.
    /// </summary>
    /// <param name="name">The name of the cookie.</param>
    /// <param name="value">The value of the cookie.</param>
    /// <exception cref="ArgumentException">If the name is <see langword="null"/> or an empty string,
    /// or if it contains a semi-colon.</exception>
    /// <exception cref="ArgumentNullException">If the value is <see langword="null"/>.</exception>
    public Cookie(string name, string value)
        : this(name, value, null)
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
    public Cookie(string name, string value, string? path)
        : this(name, value, path, null)
    {
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
    public Cookie(string name, string value, string? path, DateTime? expiry)
        : this(name, value, null, path, expiry)
    {
    }

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
    public Cookie(string name, string value, string? domain, string? path, DateTime? expiry)
        : this(name, value, domain, path, expiry, false, false, null)
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
    /// <param name="secure"><see langword="true"/> if the cookie is secure; otherwise <see langword="false"/></param>
    /// <param name="isHttpOnly"><see langword="true"/> if the cookie is an HTTP-only cookie; otherwise <see langword="false"/></param>
    /// <param name="sameSite">The SameSite value of cookie.</param>
    /// <exception cref="ArgumentException">If the name and value are both an empty string,
    /// if the name contains a semi-colon, or if same site value is not valid.</exception>
    /// <exception cref="ArgumentNullException">If the name, value or currentUrl is <see langword="null"/>.</exception>
    public Cookie(string name, string value, string? domain, string? path, DateTime? expiry, bool secure, bool isHttpOnly, string? sameSite)
    {
        if (name == null)
        {
            throw new ArgumentNullException(nameof(value), "Cookie name cannot be null");
        }

        if (value == null)
        {
            throw new ArgumentNullException(nameof(value), "Cookie value cannot be null");
        }

        if (name == string.Empty && value == string.Empty)
        {
            throw new ArgumentException("Cookie name and value cannot both be empty string");
        }

        if (name.Contains(';'))
        {
            throw new ArgumentException("Cookie names cannot contain a ';': " + name, nameof(name));
        }

        this.cookieName = name;
        this.cookieValue = value;
        if (!string.IsNullOrEmpty(path))
        {
            this.cookiePath = path;
        }

        this.cookieDomain = StripPort(domain);

        if (expiry != null)
        {
            this.cookieExpiry = expiry;
        }

        this.isHttpOnly = isHttpOnly;
        this.secure = secure;

        if (!string.IsNullOrEmpty(sameSite))
        {
            if (!sameSiteValues.Contains(sameSite))
            {
                throw new ArgumentException("Invalid sameSite cookie value. It should either \"Lax\", \"Strict\" or \"None\" ", nameof(sameSite));
            }

            this.sameSite = sameSite;
        }
    }

    /// <summary>
    /// Gets the name of the cookie.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name => this.cookieName;

    /// <summary>
    /// Gets the value of the cookie.
    /// </summary>
    [JsonPropertyName("value")]
    public string Value => this.cookieValue;

    /// <summary>
    /// Gets the domain of the cookie.
    /// </summary>
    [JsonPropertyName("domain")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Domain => this.cookieDomain;

    /// <summary>
    /// Gets the path of the cookie.
    /// </summary>
    [JsonPropertyName("path")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public virtual string? Path => this.cookiePath;

    /// <summary>
    /// Gets a value indicating whether the cookie is secure.
    /// </summary>
    [JsonPropertyName("secure")]
    public virtual bool Secure => this.secure;

    /// <summary>
    /// Gets a value indicating whether the cookie is an HTTP-only cookie.
    /// </summary>
    [JsonPropertyName("httpOnly")]
    public virtual bool IsHttpOnly => this.isHttpOnly;

    /// <summary>
    /// Gets the SameSite setting for the cookie.
    /// </summary>
    [JsonPropertyName("sameSite")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public virtual string? SameSite => this.sameSite;

    /// <summary>
    /// Gets the expiration date of the cookie.
    /// </summary>
    [JsonIgnore]
    public DateTime? Expiry => this.cookieExpiry;

    /// <summary>
    /// Gets the cookie expiration date in seconds from the defined zero date (01 January 1970 00:00:00 UTC).
    /// </summary>
    /// <remarks>This property only exists so that the JSON serializer can serialize a
    /// cookie without resorting to a custom converter.</remarks>
    [JsonPropertyName("expiry")]
    [JsonInclude]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    internal long? ExpirySeconds
    {
        get
        {
            if (this.cookieExpiry == null)
            {
                return null;
            }

            DateTime zeroDate = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            TimeSpan span = this.cookieExpiry.Value.ToUniversalTime().Subtract(zeroDate);
            long totalSeconds = Convert.ToInt64(span.TotalSeconds);
            return totalSeconds;
        }
    }

    /// <summary>
    /// Converts a Dictionary to a Cookie.
    /// </summary>
    /// <param name="rawCookie">The Dictionary object containing the cookie parameters.</param>
    /// <returns>A <see cref="Cookie"/> object with the proper parameters set.</returns>
    public static Cookie FromDictionary(Dictionary<string, object?> rawCookie)
    {
        if (rawCookie == null)
        {
            throw new ArgumentNullException(nameof(rawCookie));
        }

        string name = rawCookie["name"]!.ToString()!;
        string value = string.Empty;
        if (rawCookie.TryGetValue("value", out object? valueObj))
        {
            value = valueObj!.ToString()!;
        }

        string path = "/";
        if (rawCookie.TryGetValue("path", out object? pathObj) && pathObj != null)
        {
            path = pathObj.ToString()!;
        }

        string domain = string.Empty;
        if (rawCookie.TryGetValue("domain", out object? domainObj) && domainObj != null)
        {
            domain = domainObj.ToString()!;
        }

        DateTime? expires = null;
        if (rawCookie.TryGetValue("expiry", out object? expiryObj) && expiryObj != null)
        {
            expires = ConvertExpirationTime(expiryObj.ToString()!);
        }

        bool secure = false;
        if (rawCookie.TryGetValue("secure", out object? secureObj) && secureObj != null)
        {
            secure = bool.Parse(secureObj.ToString()!);
        }

        bool isHttpOnly = false;
        if (rawCookie.TryGetValue("httpOnly", out object? httpOnlyObj) && httpOnlyObj != null)
        {
            isHttpOnly = bool.Parse(httpOnlyObj.ToString()!);
        }

        string? sameSite = null;
        if (rawCookie.TryGetValue("sameSite", out object? sameSiteObj))
        {
            sameSite = sameSiteObj?.ToString();
        }

        return new ReturnedCookie(name, value, domain, path, expires, secure, isHttpOnly, sameSite);
    }

    /// <summary>
    /// Creates and returns a string representation of the cookie.
    /// </summary>
    /// <returns>A string representation of the cookie.</returns>
    public override string ToString()
    {
        return this.cookieName + "=" + this.cookieValue
            + (this.cookieExpiry == null ? string.Empty : "; expires=" + this.cookieExpiry.Value.ToUniversalTime().ToString("ddd MM dd yyyy hh:mm:ss UTC", CultureInfo.InvariantCulture))
                + (string.IsNullOrEmpty(this.cookiePath) ? string.Empty : "; path=" + this.cookiePath)
                + (string.IsNullOrEmpty(this.cookieDomain) ? string.Empty : "; domain=" + this.cookieDomain)
                + "; isHttpOnly= " + this.isHttpOnly + "; secure= " + this.secure + (string.IsNullOrEmpty(this.sameSite) ? string.Empty : "; sameSite=" + this.sameSite);
    }

    /// <summary>
    /// Determines whether the specified <see cref="object">Object</see> is equal
    /// to the current <see cref="object">Object</see>.
    /// </summary>
    /// <param name="obj">The <see cref="object">Object</see> to compare with the
    /// current <see cref="object">Object</see>.</param>
    /// <returns><see langword="true"/> if the specified <see cref="object">Object</see>
    /// is equal to the current <see cref="object">Object</see>; otherwise,
    /// <see langword="false"/>.</returns>
    public override bool Equals(object? obj)
    {
        // Two cookies are equal if the name and value match
        if (this == obj)
        {
            return true;
        }

        if (obj is not Cookie cookie)
        {
            return false;
        }

        if (!this.cookieName.Equals(cookie.cookieName))
        {
            return false;
        }

        return string.Equals(this.cookieValue, cookie.cookieValue);
    }

    /// <summary>
    /// Serves as a hash function for a particular type.
    /// </summary>
    /// <returns>A hash code for the current <see cref="object">Object</see>.</returns>
    public override int GetHashCode()
    {
        return this.cookieName.GetHashCode();
    }

    private static string? StripPort(string? domain)
    {
        return string.IsNullOrEmpty(domain) ? null : domain!.Split(':')[0];
    }

    private static DateTime? ConvertExpirationTime(string expirationTime)
    {
        DateTime? expires = null;
        if (double.TryParse(expirationTime, NumberStyles.Number, CultureInfo.InvariantCulture, out double seconds))
        {
            try
            {
                expires = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddSeconds(seconds).ToLocalTime();
            }
            catch (ArgumentOutOfRangeException)
            {
                expires = DateTime.MaxValue.ToLocalTime();
            }
        }

        return expires;
    }
}
