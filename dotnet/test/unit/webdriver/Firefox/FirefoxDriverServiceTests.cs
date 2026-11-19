// <copyright file="FirefoxDriverServiceTests.cs" company="Selenium Committers">
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

using System.Reflection;
using OpenQA.Selenium.Firefox;

namespace OpenQA.Selenium.Tests.Firefox;

[TestFixture]
public class FirefoxDriverServiceTests
{
    [Test]
    public void LetsFirefoxChooseTheWebSocketPort()
    {
        FirefoxDriverService service = FirefoxDriverService.CreateDefaultService();

        Assert.That(CommandLineArguments(service), Does.Contain("--websocket-port 0"));
    }

    [Test]
    public void OmitsWebSocketPortWhenConnectingToRunningBrowser()
    {
        FirefoxDriverService service = FirefoxDriverService.CreateDefaultService();
        service.ConnectToRunningBrowser = true;

        Assert.That(CommandLineArguments(service), Does.Not.Contain("--websocket-port"));
    }

    private static string CommandLineArguments(FirefoxDriverService service)
    {
        PropertyInfo property = typeof(FirefoxDriverService).GetProperty("CommandLineArguments", BindingFlags.Instance | BindingFlags.NonPublic)!;
        return (string)property.GetValue(service)!;
    }
}
