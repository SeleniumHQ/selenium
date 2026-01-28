// <copyright file="FirefoxDriverServiceTest.cs" company="Selenium Committers">
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
using System.IO;
using System.Linq;
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.Firefox;

[TestFixture]
public class FirefoxDriverServiceTest
{
    private TestLogHandler testLogHandler;

    private void ResetGlobalLog()
    {
        Log.SetLevel(LogEventLevel.Info);
        Log.Handlers.Clear().Handlers.Add(new TextWriterHandler(Console.Error));
    }

    [SetUp]
    public void SetUp()
    {
        ResetGlobalLog();

        testLogHandler = new TestLogHandler();
    }

    [TearDown]
    public void TearDown()
    {
        ResetGlobalLog();
    }

    [Test]
    public void ShouldRedirectGeckoDriverLogsToFile()
    {
        FirefoxOptions options = new FirefoxOptions();
        string logPath = Path.GetTempFileName();
        options.LogLevel = FirefoxDriverLogLevel.Info;

        FirefoxDriverService service = FirefoxDriverService.CreateDefaultService();
        service.LogPath = logPath;

        IWebDriver firefoxDriver = new FirefoxDriver(service, options);
        firefoxDriver.Quit();

        try
        {
            Assert.That(File.Exists(logPath), Is.True);
            string logContent = File.ReadAllText(logPath);
            Assert.That(logContent, Does.Contain("geckodriver"));
        }
        finally
        {
            File.Delete(logPath);
        }
    }

    [Test]
    public void ShouldRedirectGeckoDriverLogsToConsole()
    {
        Log.SetLevel(LogEventLevel.Trace).Handlers.Add(testLogHandler);
        FirefoxOptions options = new FirefoxOptions();
        options.LogLevel = FirefoxDriverLogLevel.Info;

        FirefoxDriverService service = FirefoxDriverService.CreateDefaultService();

        IWebDriver firefoxDriver = new FirefoxDriver(service, options);

        try
        {
            Assert.That(testLogHandler.Events, Has.Count.AtLeast(1));
            Assert.That(testLogHandler.Events.Any(e => e.Message.Contains("geckodriver")), Is.True);
        }
        finally
        {
            firefoxDriver.Quit();
        }
    }
}

class TestLogHandler : ILogHandler
{
    public ILogHandler Clone()
    {
        return this;
    }

    public void Handle(LogEvent logEvent)
    {
        Events.Add(logEvent);
    }

    public IList<LogEvent> Events { get; internal set; } = new List<LogEvent>();
}
