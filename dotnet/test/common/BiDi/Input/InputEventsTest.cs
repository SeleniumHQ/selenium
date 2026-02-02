// <copyright file="InputEventsTest.cs" company="Selenium Committers">
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
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium.BiDi.BrowsingContext;

namespace OpenQA.Selenium.BiDi.Input;

internal class InputEventsTest : BiDiTestFixture
{
    [Test]
    public async Task CanListenToFileDialogOpenedEvent()
    {
        TaskCompletionSource<FileDialogInfo> tcs = new();

        await using var subscription = await context.Input.OnFileDialogOpenedAsync(tcs.SetResult);

        await context.NavigateAsync(UrlBuilder.WhereIs("formPage.html"), new() { Wait = ReadinessState.Complete });

        await context.Script.EvaluateAsync("upload.click()", false, new() { UserActivation = true });

        var eventArgs = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.That(eventArgs, Is.Not.Null);
        Assert.That(eventArgs.Context, Is.EqualTo(context));
        Assert.That(eventArgs.Multiple, Is.False);
        Assert.That(eventArgs.Element, Is.Not.Null);
    }
}
