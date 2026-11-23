// <copyright file="TelemetryUnitTests.cs" company="Selenium Committers">
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

using System.Collections.Concurrent;
using System.Diagnostics;
using OpenQA.Selenium.BiDi;

namespace OpenQA.Selenium.Tests.BiDi;

// ActivityListener registration is process-wide static state, so this fixture must not
// run concurrently with anything else that might emit or observe BiDi activities.
[NonParallelizable]
[FixtureLifeCycle(LifeCycle.InstancePerTestCase)]
class TelemetryUnitTests
{
    private const string SourceName = "Selenium.WebDriver";

    private IBiDi _bidi;
    private FakeTransport _transport;
    private ConcurrentQueue<Activity> _captured;
    private ActivityListener _listener;

    [SetUp]
    public async Task SetUp()
    {
        _captured = new ConcurrentQueue<Activity>();
        _listener = new ActivityListener
        {
            ShouldListenTo = source => source.Name == SourceName,
            SampleUsingParentId = (ref ActivityCreationOptions<string> _) => ActivitySamplingResult.AllData,
            Sample = (ref _) => ActivitySamplingResult.AllData,
            ActivityStopped = _captured.Enqueue,
        };
        ActivitySource.AddActivityListener(_listener);

        _transport = new FakeTransport();
        _bidi = await Selenium.BiDi.BiDi.ConnectAsync(new Uri("ws://fake"), opts =>
            opts.UseTransport(_ => (_, _) => Task.FromResult<ITransport>(_transport)));
    }

    [TearDown]
    public async Task TearDown()
    {
        _listener.Dispose();
        await _bidi.DisposeAsync();
    }

    [Test]
    public async Task CommandActivityIsErrorStatusOnFailure()
    {
        Assert.That(
            () => _bidi.StatusAsync()
                .WithErrorResponse(_transport, "unknown error", "boom"),
            Throws.InstanceOf<BiDiException>());

        var activity = await WaitForActivityAsync(a => a.OperationName == "session.status");

        Assert.That(activity.Status, Is.EqualTo(ActivityStatusCode.Error));
        Assert.That(activity.StatusDescription, Is.EqualTo(nameof(BiDiException)));
    }

    [Test]
    public async Task PullEventActivityUsesWireMethodNameAndConsumerKind()
    {
        var stream = await _bidi.Script.RealmDestroyed.StreamAsync()
            .WithResponse(_transport, """{"subscription":"sub-1"}""");

        _transport.EnqueueEvent("script.realmDestroyed", """{"realm":"r-1"}""");

        await stream.ReadAllAsync().FirstAsync().AsTask().WaitAsync(TimeSpan.FromSeconds(5));

        var activity = await WaitForActivityAsync(a => a.OperationName == "script.realmDestroyed");
        Assert.That(activity.Kind, Is.EqualTo(ActivityKind.Consumer));

        await stream.DisposeAsync().WithResponse(_transport);
    }

    [Test]
    public async Task PushEventHandlerActivityDoesNotInheritStaleSubscribeContext()
    {
        using var ambientSource = new ActivitySource("selenium.tests.ambient");
        using var ambientListener = new ActivityListener
        {
            ShouldListenTo = source => source.Name == "selenium.tests.ambient",
            SampleUsingParentId = (ref _) => ActivitySamplingResult.AllData,
            Sample = (ref _) => ActivitySamplingResult.AllData,
        };
        ActivitySource.AddActivityListener(ambientListener);

        var tcs = new TaskCompletionSource();
        ISubscription subscription;
        string ambientTraceId;

        // Subscribe while an ambient activity is current, then let it end immediately -
        // long before any event is actually dispatched to the handler.
        using (var ambient = ambientSource.StartActivity("ambient-scope"))
        {
            ambientTraceId = ambient!.TraceId.ToString();

            subscription = await _bidi.Script.RealmDestroyed.SubscribeAsync(_ => tcs.TrySetResult())
                .WithResponse(_transport, """{"subscription":"sub-1"}""");
        }

        _transport.EnqueueEvent("script.realmDestroyed", """{"realm":"r-1"}""");
        await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        var eventActivity = await WaitForActivityAsync(a => a.OperationName == "script.realmDestroyed");

        Assert.That(eventActivity.Kind, Is.EqualTo(ActivityKind.Consumer));
        Assert.That(eventActivity.Status, Is.EqualTo(ActivityStatusCode.Ok));
        Assert.That(eventActivity.ParentId, Is.Null, "Event activity must not be parented to the subscribe-time ambient activity.");
        Assert.That(eventActivity.TraceId.ToString(), Is.Not.EqualTo(ambientTraceId));

        await subscription.DisposeAsync().WithResponse(_transport);
    }

    /// <summary>
    /// Polls <see cref="_captured"/> until an activity matching <paramref name="predicate"/> appears.
    /// </summary>
    /// <remarks>
    /// Activities are only recorded once fully stopped, which can happen slightly after a test has
    /// observed the effect (e.g. a completed <see cref="TaskCompletionSource"/>) that triggered them.
    /// </remarks>
    private async Task<Activity> WaitForActivityAsync(Func<Activity, bool> predicate)
    {
        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));

        while (!cts.IsCancellationRequested)
        {
            var match = _captured.FirstOrDefault(predicate);
            if (match is not null) return match;

            await Task.Delay(5, CancellationToken.None).ConfigureAwait(false);
        }

        throw new TimeoutException("Expected activity was not captured within the timeout.");
    }
}
