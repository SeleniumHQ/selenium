// <copyright file="SlowLoadingPageTest.cs" company="Selenium Committers">
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
using System;

namespace OpenQA.Selenium;

[TestFixture]
public class SlowLoadingPageTest : DriverTestFixture
{
    private const long LoadTimeInSeconds = 3;

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true)]
    public void ShouldBlockUntilPageLoads()
    {
        DateTime start = DateTime.Now;
        driver.Url = sleepingPage + "?time=" + LoadTimeInSeconds.ToString();
        DateTime now = DateTime.Now;
        double elapsedTime = now.Subtract(start).TotalSeconds;
        Assert.That(elapsedTime, Is.GreaterThanOrEqualTo(LoadTimeInSeconds));
    }

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true)]
    public void ShouldBlockUntilIFramesAreLoaded()
    {
        DateTime start = DateTime.Now;
        driver.Url = slowIframes;
        DateTime now = DateTime.Now;
        double elapsedTime = now.Subtract(start).TotalSeconds;
        Assert.That(elapsedTime, Is.GreaterThanOrEqualTo(LoadTimeInSeconds));
    }

    [Test]
    [NeedsFreshDriver(IsCreatedBeforeTest = true)]
    public void RefreshShouldBlockUntilPageLoads()
    {
        DateTime start = DateTime.Now;
        driver.Url = sleepingPage + "?time=" + LoadTimeInSeconds.ToString();
        DateTime now = DateTime.Now;
        double elapsedTime = now.Subtract(start).TotalSeconds;
        Assert.That(elapsedTime, Is.GreaterThanOrEqualTo(LoadTimeInSeconds));
        start = DateTime.Now;
        driver.Navigate().Refresh();
        now = DateTime.Now;
        elapsedTime = now.Subtract(start).TotalSeconds;
        Assert.That(elapsedTime, Is.GreaterThanOrEqualTo(LoadTimeInSeconds));
    }
}
