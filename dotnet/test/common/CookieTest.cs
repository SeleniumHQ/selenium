// <copyright file="CookieTest.cs" company="Selenium Committers">
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

using NUnit.Framework;
using OpenQA.Selenium.Internal;
using System;

namespace OpenQA.Selenium;

[TestFixture]
public class CookieTest
{
    [Test]
    public void CanCreateAWellFormedCookie()
    {
        new ReturnedCookie("Fish", "cod", "", "", DateTime.Now, false, false);
    }

    [Test]
    public void ShouldThrowAnExceptionWhenSemiColonExistsInTheCookieAttribute()
    {
        Assert.That(() => new ReturnedCookie("hi;hi", "value", null, null, DateTime.Now, false, false), Throws.InstanceOf<ArgumentException>());
    }

    [Test]
    public void ShouldThrowAnExceptionWhenNameAndValueAreEmpty()
    {
        Assert.That(() => new ReturnedCookie("", "", null, null, DateTime.Now, false, false), Throws.InstanceOf<ArgumentException>());
    }

    [Test]
    public void ShouldThrowAnExceptionWhenTheNameIsNull()
    {
        Assert.That(() => new ReturnedCookie(null, "value", null, null, DateTime.Now, false, false), Throws.InstanceOf<ArgumentException>());
    }

    [Test]
    public void ShouldThrowAnExceptionWhenSameSiteIsWrong()
    {
        Assert.That(() => new ReturnedCookie("name", "value", "", "/", DateTime.Now, true, true, "Wrong"), Throws.InstanceOf<ArgumentException>());
    }

    [Test]
    public void CookiesShouldAllowOptionalParametersToBeSet()
    {
        DateTime expiry = DateTime.Now;
        Cookie cookie = new Cookie("name", "value", "test.com", "/", expiry, true, true, "None");
        Assert.That(cookie.Domain, Is.EqualTo("test.com"));
        Assert.That(cookie.Path, Is.EqualTo("/"));
        Assert.That(cookie.IsHttpOnly, Is.True);
        Assert.That(cookie.Secure, Is.True);
        Assert.That(cookie.SameSite, Is.EqualTo("None"));
    }

    [Test]
    public void CookiesShouldAllowSecureToBeSet()
    {
        Cookie cookie = new ReturnedCookie("name", "value", "", "/", DateTime.Now, true, false);
        Assert.That(cookie.Secure, Is.True);
    }

    [Test]
    public void SecureDefaultsToFalse()
    {
        Cookie cookie = new Cookie("name", "value");
        Assert.That(cookie.Secure, Is.False);
    }

    [Test]
    public void CookiesShouldAllowHttpOnlyToBeSet()
    {
        Cookie cookie = new ReturnedCookie("name", "value", "", "/", DateTime.Now, false, true);
        Assert.That(cookie.IsHttpOnly, Is.True);
    }

    [Test]
    public void HttpOnlyDefaultsToFalse()
    {
        Cookie cookie = new Cookie("name", "value");
        Assert.That(cookie.IsHttpOnly, Is.False);
    }

    //------------------------------------------------------------------
    // Tests below here are not included in the Java test suite
    //------------------------------------------------------------------
    [Test]
    public void ShouldThrowAnExceptionWhenTheValueIsNull()
    {
        Assert.That(() => new ReturnedCookie("name", null, null, null, DateTime.Now, false, false), Throws.InstanceOf<ArgumentNullException>());
    }

    [Test]
    public void ShouldAllowExpiryToBeNull()
    {
        Cookie cookie = new ReturnedCookie("name", "value", "", "/", null, false, false);
    }
}
