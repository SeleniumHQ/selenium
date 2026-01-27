// <copyright file="SessionTest.cs" company="Selenium Committers">
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
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Session;

internal class SessionTest : BiDiTestFixture
{
    [Test]
    public async Task CanGetStatus()
    {
        var status = await bidi.StatusAsync();

        Assert.That(status, Is.Not.Null);
        Assert.That(status.Message, Is.Not.Empty);
    }

    [Test]
    public async Task ShouldRespectTimeout()
    {
        Assert.That(
            () => bidi.StatusAsync(new() { Timeout = TimeSpan.FromMicroseconds(1) }),
            Throws.InstanceOf<TaskCanceledException>());
    }

    [Test]
    public async Task ShouldRespectCancellationToken()
    {
        using var cts = new CancellationTokenSource(TimeSpan.FromMicroseconds(1));

        Assert.That(
            () => bidi.StatusAsync(cancellationToken: cts.Token),
            Throws.InstanceOf<TaskCanceledException>());
    }
}
