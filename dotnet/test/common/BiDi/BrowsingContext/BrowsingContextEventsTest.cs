// <copyright file="BrowsingContextEventsTest.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.BrowsingContext;

class BrowsingContextEventsTest : BiDiTestFixture
{
    [Test]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Not supported yet?")]
    public async Task CanListenDownloadWillBeginEvent()
    {
        await context.NavigateAsync(UrlBuilder.WhereIs("downloads/download.html"), new() { Wait = ReadinessState.Complete });

        TaskCompletionSource<DownloadWillBeginEventArgs> tcs = new();

        await using var subscription = await context.OnDownloadWillBeginAsync(tcs.SetResult);

        driver.FindElement(By.Id("file-1")).Click();

        var eventArgs = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(eventArgs, Is.Not.Null);
        Assert.That(eventArgs.Context, Is.EqualTo(context));
        Assert.That(eventArgs.Url, Does.EndWith("downloads/file_1.txt"));
        Assert.That(eventArgs.SuggestedFilename, Is.EqualTo("file_1.txt"));
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Not supported yet?")]
    public async Task CanListenDownloadEndEvent()
    {
        await context.NavigateAsync(UrlBuilder.WhereIs("downloads/download.html"), new() { Wait = ReadinessState.Complete });

        TaskCompletionSource<DownloadEndEventArgs> tcs = new();

        await using var subscription = await context.OnDownloadEndAsync(tcs.SetResult);

        driver.FindElement(By.Id("file-1")).Click();

        var eventArgs = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(eventArgs, Is.Not.Null);
        Assert.That(eventArgs.Context, Is.EqualTo(context));
        Assert.That(eventArgs, Is.TypeOf<DownloadCompleteEventArgs>());
        Assert.That(((DownloadCompleteEventArgs)eventArgs).Filepath, Is.Not.Empty);
    }
}
