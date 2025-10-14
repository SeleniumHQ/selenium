// <copyright file="FirefoxProfileTests.cs" company="Selenium Committers">
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
using System.Collections.Generic;

namespace OpenQA.Selenium.Firefox;

[TestFixture]
public class FirefoxProfileTests
{
    private FirefoxProfile profile;

    [SetUp]
    public void SetUp()
    {
        profile = new FirefoxProfile();
    }

    [TearDown]
    public void TearDown()
    {
        profile.Clean();
    }

    //[Test]
    public void ShouldQuoteStringsWhenSettingStringProperties()
    {
        profile.SetPreference("cheese", "brie");

        List<string> props = ReadGeneratedProperties();
        bool seenCheese = false;
        foreach (string line in props)
        {
            if (line.Contains("cheese") && line.Contains("\"brie\""))
            {
                seenCheese = true;
                break;
            }
        }
        Assert.That(seenCheese, Is.True);
    }

    //[Test]
    public void ShouldSetIntegerPreferences()
    {
        profile.SetPreference("cheese", 1234);

        List<string> props = ReadGeneratedProperties();
        bool seenCheese = false;
        foreach (string line in props)
        {
            if (line.Contains("cheese") && line.Contains(", 1234)"))
            {
                seenCheese = true;
                break;
            }
        }
        Assert.That(seenCheese, Is.True, "Did not see integer value being set correctly");
    }

    //[Test]
    public void testShouldSetBooleanPreferences()
    {
        profile.SetPreference("cheese", false);

        List<string> props = ReadGeneratedProperties();
        bool seenCheese = false;
        foreach (string line in props)
        {
            if (line.Contains("cheese") && line.Contains(", false)"))
            {
                seenCheese = true;
            }
        }

        Assert.That(seenCheese, Is.True, "Did not see boolean value being set correctly");
    }

    private List<string> ReadGeneratedProperties()
    {
        profile.WriteToDisk();
        List<string> generatedProperties = new List<string>();
        string userPrefs = System.IO.Path.Combine(profile.ProfileDirectory, "user.js");
        if (System.IO.File.Exists(userPrefs))
        {
            string[] fileLines = System.IO.File.ReadAllLines(userPrefs);
            generatedProperties = new List<string>(fileLines);
        }
        return generatedProperties;
    }
}
