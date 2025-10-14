// <copyright file="LogTest.cs" company="Selenium Committers">
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
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Log;

class LogTest : BiDiTestFixture
{
    [Test]
    public async Task CanListenToConsoleLog()
    {
        TaskCompletionSource<LogEntry> tcs = new();

        await using var subscription = await context.Log.OnEntryAddedAsync(tcs.SetResult);

        driver.Url = UrlBuilder.WhereIs("bidi/logEntryAdded.html");
        driver.FindElement(By.Id("consoleLog")).Click();

        var logEntry = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(logEntry, Is.Not.Null);
        Assert.That(logEntry.Source, Is.Not.Null);
        Assert.That(logEntry.Source.Context, Is.EqualTo(context));
        Assert.That(logEntry.Source.Realm, Is.Not.Null);
        Assert.That(logEntry.Text, Is.EqualTo("Hello, world!"));
        Assert.That(logEntry.Level, Is.EqualTo(Level.Info));
        Assert.That(logEntry, Is.AssignableFrom<ConsoleLogEntry>());

        var consoleLogEntry = logEntry as ConsoleLogEntry;

        Assert.That(consoleLogEntry.Method, Is.EqualTo("log"));

        Assert.That(consoleLogEntry.Args, Is.Not.Null);
        Assert.That(consoleLogEntry.Args, Has.Count.EqualTo(1));
        Assert.That(consoleLogEntry.Args[0], Is.AssignableFrom<Script.StringRemoteValue>());
    }

    [Test]
    public async Task CanListenToJavascriptLog()
    {
        TaskCompletionSource<Log.LogEntry> tcs = new();

        await using var subscription = await context.Log.OnEntryAddedAsync(tcs.SetResult);

        driver.Url = UrlBuilder.WhereIs("bidi/logEntryAdded.html");
        driver.FindElement(By.Id("jsException")).Click();

        var logEntry = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(logEntry, Is.Not.Null);
        Assert.That(logEntry.Source, Is.Not.Null);
        Assert.That(logEntry.Source.Context, Is.EqualTo(context));
        Assert.That(logEntry.Source.Realm, Is.Not.Null);
        Assert.That(logEntry.Text, Is.EqualTo("Error: Not working"));
        Assert.That(logEntry.Level, Is.EqualTo(Level.Error));
        Assert.That(logEntry, Is.AssignableFrom<JavascriptLogEntry>());
    }

    [Test]
    public async Task CanRetrieveStacktrace()
    {
        TaskCompletionSource<LogEntry> tcs = new();

        await using var subscription = await bidi.Log.OnEntryAddedAsync(tcs.SetResult);

        driver.Url = UrlBuilder.WhereIs("bidi/logEntryAdded.html");
        driver.FindElement(By.Id("logWithStacktrace")).Click();

        var logEntry = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(logEntry, Is.Not.Null);
        Assert.That(logEntry.StackTrace, Is.Not.Null);
    }
}
