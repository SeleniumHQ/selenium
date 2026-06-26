// <copyright file="SessionTests.cs" company="Selenium Committers">
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

using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi;
using OpenQA.Selenium.BiDi.Log;
using OpenQA.Selenium.BiDi.Network;

namespace OpenQA.Selenium.Tests.BiDi.Session;

internal class SessionTests : BiDiTestFixture
{
    [Test]
    public async Task CanGetStatus()
    {
        var status = await bidi.StatusAsync();

        Assert.That(status, Is.Not.Null);
        Assert.That(status.Message, Is.Not.Empty);
    }

    [Test]
    public void AsModuleShouldReturnSameInstanceForSameType()
    {
        var module = bidi.AsModule<CustomModule>();

        Assert.That(bidi.AsModule<CustomModule>(), Is.SameAs(module));
    }

    [Test]
    public async Task CanSubscribeToEvent()
    {
        TaskCompletionSource<EntryAddedEventArgs> tcs = new();

        var listener = await bidi.SubscribeAsync(LogEvent.EntryAdded, e =>
        {
            tcs.TrySetResult(e);
        });

        await context.Script.EvaluateAsync("console.log('hello event');", true);

        var log = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        await listener.DisposeAsync();

        Assert.That(log.Text, Is.EqualTo("hello event"));
    }

    [Test]
    public async Task CanSubscribeToMultipleEvents()
    {
        TaskCompletionSource<ResponseStartedEventArgs> tcs1 = new();
        TaskCompletionSource<ResponseCompletedEventArgs> tcs2 = new();

        var listener = await bidi.SubscribeAsync([NetworkEvent.ResponseStarted, NetworkEvent.ResponseCompleted], (OpenQA.Selenium.BiDi.EventArgs e) =>
        {
            switch (e)
            {
                case ResponseStartedEventArgs started: tcs1.TrySetResult(started); break;
                case ResponseCompletedEventArgs completed: tcs2.TrySetResult(completed); break;
            }
        });

        await context.NavigateAsync(UrlBuilder.WhereIs("blank.html"), new() { Wait = OpenQA.Selenium.BiDi.BrowsingContext.ReadinessState.Complete });

        var e1 = await tcs1.Task.WaitAsync(TimeSpan.FromSeconds(5));
        var e2 = await tcs2.Task.WaitAsync(TimeSpan.FromSeconds(5));

        await listener.DisposeAsync();

        Assert.That(e1, Is.Not.Null);
        Assert.That(e2, Is.Not.Null);
    }

    [Test]
    public async Task CanConsumeAsyncEventStream()
    {
        await using var sub = await bidi.Log.EntryAdded.StreamAsync();

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        await using var enumerator = sub.ReadAllAsync(cts.Token).GetAsyncEnumerator();

        await context.Script.EvaluateAsync("console.log('hello stream');", true);

        Assert.That(await enumerator.MoveNextAsync(), Is.True);
        Assert.That(enumerator.Current.Text, Is.EqualTo("hello stream"));
    }

    [Test]
    public async Task CanConsumeAsyncEventStreamViaLinq()
    {
        await using var sub = await bidi.Log.EntryAdded.StreamAsync();

        await context.Script.EvaluateAsync("console.log('hello stream');", true);

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        var log = await sub.ReadAllAsync(cts.Token).FirstAsync();

        Assert.That(log.Text, Is.EqualTo("hello stream"));
    }

    [Test]
    public async Task EventStreamRespectsReadAllCancellationToken()
    {
        using var cts = new CancellationTokenSource();

        await using var sub = await bidi.Log.EntryAdded.StreamAsync();

        cts.Cancel();

        Assert.ThrowsAsync<TaskCanceledException>(async () =>
        {
            await foreach (var _ in sub.ReadAllAsync(cts.Token)) { }
        });
    }

    [Test]
    public async Task EventStreamCancellationTokenFiresDuringEnumeration()
    {
        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(200));

        await using var sub = await bidi.Log.EntryAdded.StreamAsync();

        Assert.ThrowsAsync<OperationCanceledException>(async () =>
        {
            await foreach (var _ in sub.ReadAllAsync(cts.Token)) { }
        });
    }

    [Test]
    public async Task CustomModuleShouldExecuteCommand()
    {
        var customModule = bidi.AsModule<CustomModule>();

        var result = await customModule.DoSomethingAsync();

        Assert.That(result, Is.Not.Null);
    }

    [Test]
    public async Task CustomModuleShouldSubscribeToEvent()
    {
        var customModule = bidi.AsModule<CustomModule>();

        TaskCompletionSource<SomethingHappenedEventArgs> tcs = new();

        var listener = await customModule.SomethingHappened.SubscribeAsync(e =>
        {
            tcs.TrySetResult(e);
        });

        await context.Script.EvaluateAsync("console.log('custom event');", true);

        var happened = await tcs.Task.WaitAsync(TimeSpan.FromSeconds(5));

        await listener.DisposeAsync();

        Assert.That(happened, Is.Not.Null);
        Assert.That(happened.Text, Is.EqualTo("custom event"));
    }
}

class CustomModule : Module
{
    private static readonly CustomModuleJsonSerializerContext JsonContext = CustomModuleJsonSerializerContext.Default;

    private static readonly Command<Parameters, DoSomethingResult> DoSomethingCommand =
        new("session.status", JsonContext.Parameters, JsonContext.DoSomethingResult);

    private static readonly EventDescriptor<SomethingHappenedEventArgs> SomethingHappenedDescriptor =
        EventDescriptor<SomethingHappenedEventArgs>.Create(
            "log.entryAdded",
            JsonContext.SomethingHappenedEventArgs);

    public IEventSource<SomethingHappenedEventArgs> SomethingHappened => CreateEventSource(SomethingHappenedDescriptor);

    public async Task<DoSomethingResult> DoSomethingAsync(DoSomethingOptions options = null)
    {
        return await ExecuteAsync(DoSomethingCommand, Parameters.Empty, options, CancellationToken.None);
    }
}

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
[JsonSerializable(typeof(Parameters))]
[JsonSerializable(typeof(DoSomethingResult))]
[JsonSerializable(typeof(SomethingHappenedEventArgs))]
partial class CustomModuleJsonSerializerContext : JsonSerializerContext;

record DoSomethingResult : EmptyResult;

record DoSomethingOptions : CommandOptions;

record SomethingHappenedEventArgs(string Text) : Selenium.BiDi.EventArgs;
