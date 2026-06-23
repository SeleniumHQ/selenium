// <copyright file="EventStreamExtensionsTests.cs" company="Selenium Committers">
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

using System.Runtime.CompilerServices;
using OpenQA.Selenium.BiDi;

namespace OpenQA.Selenium.Tests.BiDi;

[Parallelizable(ParallelScope.All)]
[FixtureLifeCycle(LifeCycle.InstancePerTestCase)]
class EventStreamExtensionsTests
{
    private IBiDi _bidi;
    private FakeTransport _transport;

    [SetUp]
    public async Task SetUp()
    {
        _transport = new FakeTransport();
        _bidi = await Selenium.BiDi.BiDi.ConnectAsync(new Uri("ws://fake"), opts => opts.UseTransport(() => _transport));
    }

    [TearDown]
    public async Task TearDown()
    {
        await _bidi.DisposeAsync();
    }

    [Test]
    public async Task ConfigureAwait_ReturnsConfiguredCancelableAsyncEnumerable()
    {
        var stream = await _bidi.Script.RealmDestroyed.StreamAsync()
            .WithResponse(_transport, """{"subscription":"sub-1"}""");

        // This line previously failed to compile (CS0121) because IEventStream<T> implements
        // both IAsyncEnumerable<T> and IAsyncDisposable and both have a matching ConfigureAwait overload.
        // EventStreamExtensions.ConfigureAwait disambiguates toward IAsyncEnumerable<T>.
        var configured = stream.ConfigureAwait(false);

        Assert.That(configured, Is.InstanceOf<ConfiguredCancelableAsyncEnumerable<BiDi.Script.RealmDestroyedEventArgs>>());

        await stream.DisposeAsync().WithResponse(_transport);
    }

    [Test]
    public async Task ConfigureAwait_DeliverEventsThroughConfiguredEnumerable()
    {
        var stream = await _bidi.Script.RealmDestroyed.StreamAsync()
            .WithResponse(_transport, """{"subscription":"sub-1"}""");

        _transport.EnqueueEvent("script.realmDestroyed", """{"realm":"r-1"}""");

        var received = new List<BiDi.Script.RealmDestroyedEventArgs>();

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));

        await foreach (var e in stream.ConfigureAwait(false).WithCancellation(cts.Token))
        {
            received.Add(e);
            break;
        }

        Assert.That(received, Has.Count.EqualTo(1));
        Assert.That(received[0].Realm.Id, Is.EqualTo("r-1"));

        await stream.DisposeAsync().WithResponse(_transport);
    }
}
