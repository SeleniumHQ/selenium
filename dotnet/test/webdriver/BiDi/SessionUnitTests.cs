// <copyright file="SessionUnitTests.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi;

namespace OpenQA.Selenium.Tests.BiDi;

[Parallelizable(ParallelScope.All)]
[FixtureLifeCycle(LifeCycle.InstancePerTestCase)]
class SessionUnitTests
{
    private IBiDi _bidi;
    private FakeTransport _transport;

    [SetUp]
    public async Task SetUp()
    {
        _transport = new FakeTransport();
        _bidi = await Selenium.BiDi.BiDi.ConnectAsync("ws://fake", opts => opts.UseTransport(() => _transport));
    }

    [TearDown]
    public async Task TearDown()
    {
        await _bidi.DisposeAsync();
    }

    [Test]
    public void ShouldRespectCommandTimeout()
    {
        Assert.That(
            () => _bidi.StatusAsync(new() { Timeout = TimeSpan.FromMilliseconds(1) }),
            Throws.InstanceOf<TaskCanceledException>());
    }

    [Test]
    public void ShouldRespectCancellationToken()
    {
        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(1));

        Assert.That(
            () => _bidi.StatusAsync(cancellationToken: cts.Token),
            Throws.InstanceOf<TaskCanceledException>());
    }

    [Test]
    public async Task ShouldHaveIdempotentDisposal()
    {
        await _bidi.DisposeAsync();
        await _bidi.DisposeAsync();
    }

    [Test]
    public async Task StatusCommandSendsCorrectMethod()
    {
        var task = _bidi.StatusAsync();
        await _transport.WaitForSentMessagesAsync(1);
        _transport.EnqueueSuccess(1, """{"ready":true,"message":"running"}""");

        var status = await task;

        Assert.That(status.Message, Is.EqualTo("running"));

        Assert.That(_transport.SentMessages, Has.Count.EqualTo(1));
        Assert.That(_transport.SentMessages[0], Does.Contain("\"method\":\"session.status\""));
    }

    [Test]
    public async Task ErrorResponseThrowsBiDiException()
    {
        var task = _bidi.StatusAsync();
        await _transport.WaitForSentMessagesAsync(1);
        _transport.EnqueueError(1, error: "invalid argument", message: "missing required field");

        Assert.That(
            async () => await task,
            Throws.InstanceOf<BiDiException>()
                  .With.Message.Contains("invalid argument"));
    }

    [Test]
    public async Task CommandIdsAreSequential()
    {
        var task1 = _bidi.StatusAsync();
        await _transport.WaitForSentMessagesAsync(1);
        _transport.EnqueueSuccess(1, """{"ready":true,"message":"first"}""");
        await task1;

        var task2 = _bidi.StatusAsync();
        await _transport.WaitForSentMessagesAsync(2);
        _transport.EnqueueSuccess(2, """{"ready":true,"message":"second"}""");
        await task2;

        var id1 = System.Text.Json.JsonDocument.Parse(_transport.SentMessages[0]).RootElement.GetProperty("id").GetInt64();
        var id2 = System.Text.Json.JsonDocument.Parse(_transport.SentMessages[1]).RootElement.GetProperty("id").GetInt64();

        Assert.That(id2, Is.EqualTo(id1 + 1));
    }
}
