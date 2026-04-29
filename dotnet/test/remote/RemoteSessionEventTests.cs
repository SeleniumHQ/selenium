// <copyright file="RemoteSessionEventTests.cs" company="Selenium Committers">
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
using NUnit.Framework;
using OpenQA.Selenium.Tests;

namespace OpenQA.Selenium.Remote;

[TestFixture]
public class RemoteSessionEventTests : DriverTestFixture
{
    [Test]
    public void CanFireSessionEventWithPayload()
    {
        RemoteWebDriver remoteDriver = new ChromeRemoteWebDriver();
        try
        {
            remoteDriver.Url = simpleTestPage;

            var payload = new Dictionary<string, object>
            {
                { "testName", "LoginTest" },
                { "error", "Element not found" }
            };

            var result = remoteDriver.FireSessionEvent("test:failed", payload);

            Assert.That(result, Does.ContainKey("success"));
            Assert.That(result["success"], Is.True);
            Assert.That(result, Does.ContainKey("eventType"));
            Assert.That(result["eventType"], Is.EqualTo("test:failed"));
            Assert.That(result, Does.ContainKey("timestamp"));
        }
        finally
        {
            remoteDriver.Quit();
        }
    }

    [Test]
    public void CanFireSessionEventWithoutPayload()
    {
        RemoteWebDriver remoteDriver = new ChromeRemoteWebDriver();
        try
        {
            remoteDriver.Url = simpleTestPage;

            var result = remoteDriver.FireSessionEvent("log:collect");

            Assert.That(result, Does.ContainKey("success"));
            Assert.That(result["success"], Is.True);
            Assert.That(result, Does.ContainKey("eventType"));
            Assert.That(result["eventType"], Is.EqualTo("log:collect"));
        }
        finally
        {
            remoteDriver.Quit();
        }
    }

    [Test]
    public void FireSessionEventRequiresEventType()
    {
        RemoteWebDriver remoteDriver = new ChromeRemoteWebDriver();
        try
        {
            Assert.Throws<ArgumentException>(() =>
            {
                remoteDriver.FireSessionEvent(null!);
            });

            Assert.Throws<ArgumentException>(() =>
            {
                remoteDriver.FireSessionEvent("");
            });
        }
        finally
        {
            remoteDriver.Quit();
        }
    }

    [Test]
    public void FireSessionEventCommandExists()
    {
        Assert.That(DriverCommand.FireSessionEvent, Is.EqualTo("fireSessionEvent"));
        Assert.That(DriverCommand.KnownCommands, Does.Contain(DriverCommand.FireSessionEvent));
    }
}
