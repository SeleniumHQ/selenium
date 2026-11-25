// <copyright file="ByTests.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class ByTests
{
    [Test]
    public void IdStartingWithADigitKeepsTheEscapedRemainder()
    {
        By by = By.Id("5a#b");

        Assert.That(by.Mechanism, Is.EqualTo("css selector"));
        Assert.That(by.Criteria, Is.EqualTo("#\\35 a\\#b"));
    }

    [Test]
    public void IdStartingWithANonAsciiDigitIsLeftAlone()
    {
        By arabicIndicFive = By.Id("\u0665foo");
        By asciiFive = By.Id("5foo");

        Assert.That(arabicIndicFive.Criteria, Is.EqualTo("#\u0665foo"));
        Assert.That(arabicIndicFive.Criteria, Is.Not.EqualTo(asciiFive.Criteria));
    }

    [Test]
    public void NewlineInAnIdIsHexEscaped()
    {
        By by = By.Id("a\nb");

        Assert.That(by.Criteria, Is.EqualTo("#a\\a b"));
    }

    [Test]
    public void ClassNameStartingWithADigitIsASingleClassSelector()
    {
        By by = By.ClassName("1foo");

        Assert.That(by.Criteria, Is.EqualTo(".\\31 foo"));
    }

    [Test]
    public void ClassNameWithASpaceIsRejected()
    {
        Assert.That(() => By.ClassName("one two"), Throws.InstanceOf<InvalidSelectorException>());
    }

    [Test]
    public void NameWithASpaceIsEscapedInsideTheAttribute()
    {
        Assert.That(By.Name("frame 1").Criteria, Is.EqualTo("*[name =\"frame\\ 1\"]"));
    }

    [Test]
    public void NameStartingWithADigitKeepsTheEscapedRemainder()
    {
        Assert.That(By.Name("1 a").Criteria, Is.EqualTo("*[name =\"\\31 \\ a\"]"));
    }
}
